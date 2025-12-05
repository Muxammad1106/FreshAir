from rest_framework.response import Response
from rest_framework.views import APIView

from toolkit.views import BaseView, CreateMixin, ListMixin
from core.models import Room, CustomerOrder, DeviceInstance, DeviceMetric
from core.serializers.room import RoomSerializer
from core.serializers.customer_order import CustomerOrderSerializer
from core.serializers.device import DeviceInstanceSerializer, DeviceMetricSerializer


class CustomerMixin:
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(customer=self.request.user)


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

    def perform_create(self, serializer):
        serializer.validated_data['customer'] = self.request.user
        super().perform_create(serializer)


class CustomerOrderListView(CustomerMixin, ListMixin, CreateMixin, BaseView):
    """
    Список заказов клиента / Создать заказ.
    
    GET: Возвращает список всех заказов текущего клиента.
    Поддерживает фильтрацию по статусу через query параметр ?status=PENDING.
    
    POST: Создаёт новый заказ на установку системы.
    Клиент выбирает помещение.
    После создания заказ получает статус PENDING.
    """
    serializer_class = CustomerOrderSerializer
    queryset = CustomerOrder.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
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

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(customer=self.request.user, status=DeviceInstance.STATUS_ACTIVE).order_by('-created_at')


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
        since = timezone.now() - timedelta(days=days)
        
        metrics = DeviceMetric.objects.filter(device=device, timestamp__gte=since).order_by('timestamp')
        serializer = DeviceMetricSerializer(metrics, many=True)
        
        return Response({
            'device_id': device.id,
            'range': range_param,
            'points': serializer.data
        })

