from rest_framework.response import Response
from rest_framework.views import APIView

from django.db import transaction
from toolkit.views import BaseView, CreateMixin, ListMixin
from core.models import Room, CustomerOrder, DeviceInstance, DeviceMetric, DeviceType, OrderRoom, OrderRoomDeviceType, OrderDevice
from core.serializers.room import RoomSerializer
from core.serializers.customer_order import CustomerOrderSerializer
from core.serializers.device import DeviceInstanceSerializer, DeviceMetricSerializer, DeviceTypeSerializer


class CustomerMixin:
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(customer=self.request.user)


class DeviceTypeListView(ListMixin, BaseView):
    """
    Каталог типов устройств.
    
    GET: Возвращает список всех доступных типов устройств.
    Поддерживает фильтрацию по категории через query параметр ?category=PURIFIER.
    Каталог доступен всем аутентифицированным клиентам без проверки специальных прав.
    """
    serializer_class = DeviceTypeSerializer
    queryset = DeviceType.objects.all()
    check_retrieve_permission = False  # Отключаем проверку прав - каталог доступен всем клиентам

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(device_category=category)
        return queryset.order_by('device_category', 'name')


class RoomListView(CustomerMixin, ListMixin, CreateMixin, BaseView):
    """
    Список помещений клиента / Создать помещение.
    
    GET: Возвращает список всех помещений текущего клиента.
    
    POST: Создаёт новое помещение для клиента.
    При указании высоты потолка (ceiling_height_m) объём (volume_m3) рассчитывается автоматически.
    Типы помещений: HOME, COMMERCIAL, INDUSTRIAL.
    """
    serializer_class = RoomSerializer
    queryset = Room.objects.all()
    check_retrieve_permission = False  # Фильтрация по customer обеспечивает безопасность
    check_create_permission = False  # Отключаем проверку прав для создания - customer уже установлен в perform_create

    def perform_create(self, serializer):
        serializer.validated_data['customer'] = self.request.user
        super().perform_create(serializer)


class CustomerOrderListView(CustomerMixin, ListMixin, CreateMixin, BaseView):
    """
    Список заказов клиента / Создать заказ.
    
    GET: Возвращает список всех заказов текущего клиента.
    Поддерживает фильтрацию по статусу через query параметр ?status=PENDING.
    
    POST: Создаёт новый заказ на установку системы.
    Поддерживает два формата:
    1. Старый формат: room_id (для обратной совместимости)
    2. Новый формат: rooms_data - массив комнат с типами устройств:
       {
         "rooms_data": [
           {
             "name": "Гостиная",
             "room_type": "HOME",
             "area_m2": 50,
             "ceiling_height_m": 2.5,
             "device_type_ids": [1, 2]
           }
         ],
         "comment": "Опциональный комментарий"
       }
    После создания заказ получает статус PENDING.
    """
    serializer_class = CustomerOrderSerializer
    queryset = CustomerOrder.objects.all()
    check_retrieve_permission = False  # Фильтрация по customer обеспечивает безопасность
    check_create_permission = False  # Отключаем проверку прав для создания - customer уже установлен в perform_create

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.prefetch_related(
            'order_rooms__room',
            'order_rooms__device_types',  # device_types уже указывает на DeviceType
            'devices__device_type',
            'devices__room'
        )
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    def perform_create(self, serializer):
        serializer.validated_data['customer'] = self.request.user
        return serializer.save()


class CustomerDeviceListView(CustomerMixin, ListMixin, BaseView):
    """
    Дашборд устройств клиента.
    
    Возвращает список всех активных устройств клиента с краткой информацией.
    Для каждого устройства отображается:
    - Название типа устройства
    - Название помещения
    - Статус устройства
    - Последние метрики (PM2.5, влажность, износ фильтров, уровень жидкости)
    """
    serializer_class = DeviceInstanceSerializer
    queryset = DeviceInstance.objects.select_related('device_type', 'room').prefetch_related('metrics').all()
    check_retrieve_permission = False  # Фильтрация по customer обеспечивает безопасность

    def get_queryset(self):
        queryset = super().get_queryset()
        # Показываем все устройства клиента (ACTIVE, ORDERED, INSTALLING), но не DISABLED и не в MAINTENANCE
        return queryset.filter(
            customer=self.request.user
        ).exclude(
            status__in=[DeviceInstance.STATUS_DISABLED, DeviceInstance.STATUS_MAINTENANCE]
        ).order_by('-created_at')


class DeviceToggleView(APIView):
    """
    Переключить состояние устройства (вкл/выкл).
    
    Позволяет клиенту включить или выключить устройство.
    Принимает параметр is_power_on (true/false).
    """
    def patch(self, request, pk):
        try:
            device = DeviceInstance.objects.get(pk=pk)
        except DeviceInstance.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound()
        
        if device.customer != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        
        is_power_on = request.data.get('is_power_on')
        if is_power_on is not None:
            device.is_power_on = is_power_on
            device.save()
        
        serializer = DeviceInstanceSerializer(device)
        return Response(serializer.data)


class DeviceMetricsView(APIView):
    """
    Получить детальные метрики устройства.
    
    Возвращает временной ряд показателей для графиков за указанный период.
    Поддерживает query параметр range: 1d, 7d (по умолчанию), 30d.
    
    Метрики включают:
    - PM2.5 (уровень загрязнения воздуха)
    - Влажность
    - Объём очищенного воздуха (м³)
    - Износ фильтров (%)
    - Уровень жидкости в увлажнителе (%)
    """
    def get(self, request, pk):
        try:
            device = DeviceInstance.objects.get(pk=pk)
        except DeviceInstance.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound()
        
        if device.customer != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        
        range_param = request.query_params.get('range', '7d')
        days = 7
        if range_param == '30d':
            days = 30
        elif range_param == '1d':
            days = 1
        
        from django.utils import timezone
        from datetime import timedelta
        from core.utils.metrics_generator import ensure_device_has_recent_metrics, generate_metrics_for_device
        
        # Убеждаемся, что у устройства есть свежие метрики
        ensure_device_has_recent_metrics(device, hours_back=1)
        
        since = timezone.now() - timedelta(days=days)
        
        # Получаем существующие метрики
        metrics = DeviceMetric.objects.filter(device=device, timestamp__gte=since).order_by('timestamp')
        
        # Если метрик мало или нет вообще, генерируем их
        if metrics.count() < 10:
            # Генерируем метрики за указанный период
            generate_metrics_for_device(device, days=days, interval_hours=1 if days <= 1 else (2 if days <= 7 else 6))
            # Обновляем queryset
            metrics = DeviceMetric.objects.filter(device=device, timestamp__gte=since).order_by('timestamp')
        
        serializer = DeviceMetricSerializer(metrics, many=True)
        
        return Response({
            'device_id': device.id,
            'range': range_param,
            'points': serializer.data
        })


class CustomerOrderPayView(APIView):
    """
    Моковая оплата заказа клиента.
    
    POST: Подтверждает оплату заказа (фейковый платёж).
    Проверяет, что заказ принадлежит клиенту и имеет статус PENDING.
    После оплаты:
    - Меняет статус заказа на APPROVED
    - Автоматически создаёт DeviceInstance для каждого типа устройства в каждой комнате заказа
    - Связывает созданные устройства с заказом через OrderDevice
    """
    
    @transaction.atomic
    def post(self, request, pk):
        from django.utils import timezone
        from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied
        
        try:
            order = CustomerOrder.objects.prefetch_related(
                'order_rooms__room',
                'order_rooms__device_types'  # device_types уже указывает на DeviceType
            ).get(pk=pk)
        except CustomerOrder.DoesNotExist:
            raise NotFound('Order not found')
        
        # Проверка прав доступа
        if order.customer != request.user:
            raise PermissionDenied('You do not have permission to pay this order')
        
        # Проверка статуса
        if order.status != CustomerOrder.STATUS_PENDING:
            raise ValidationError(f'Order is not in PENDING status. Current status: {order.status}')
        
        # Меняем статус заказа
        order.status = CustomerOrder.STATUS_APPROVED
        order.save()
        
        # Создаем устройства для каждой комнаты в заказе
        created_devices = []
        for order_room in order.order_rooms.all():
            room = order_room.room
            for order_room_device_type in order_room.order_room_device_types.all():
                device_type = order_room_device_type.device_type
                
                # Создаем DeviceInstance со статусом ACTIVE, так как оплата уже прошла
                device = DeviceInstance.objects.create(
                    device_type=device_type,
                    room=room,
                    customer=order.customer,
                    status=DeviceInstance.STATUS_ACTIVE,
                    is_power_on=True  # По умолчанию включено
                )
                created_devices.append(device)
                
                # Связываем устройство с заказом через OrderDevice
                OrderDevice.objects.get_or_create(order=order, device=device)
        
        # Если заказ был создан в старом формате (с одной комнатой через room)
        if order.room and not order.order_rooms.exists():
            # Для обратной совместимости - если нет order_rooms, но есть room
            # Это старый формат, пропускаем создание устройств
            pass
        
        # Возвращаем обновленный заказ с созданными устройствами
        serializer = CustomerOrderSerializer(order)
        return Response({
            'order': serializer.data,
            'devices_created': len(created_devices),
            'message': 'Payment confirmed. Devices created successfully.'
        })

