from rest_framework.response import Response
from rest_framework.views import APIView

from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from toolkit.views import BaseView, CreateMixin, ListMixin
from core.models import Room, CustomerOrder, DeviceInstance, DeviceMetric, DeviceType, OrderRoom, OrderRoomDeviceType, OrderDevice, PaymentCard, Payment, Subscription
from core.serializers.room import RoomSerializer
from core.serializers.customer_order import CustomerOrderSerializer
from core.serializers.device import DeviceInstanceSerializer, DeviceMetricSerializer, DeviceTypeSerializer
from core.serializers.payment import PaymentCardSerializer, PaymentCardCreateSerializer, PaymentSerializer
from core.serializers.subscription import SubscriptionSerializer


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
        queryset = queryset.filter(
            customer=self.request.user
        ).exclude(
            status__in=[DeviceInstance.STATUS_DISABLED, DeviceInstance.STATUS_MAINTENANCE]
        )
        
        # Фильтрация по комнате, если указана
        room_id = self.request.query_params.get('room_id')
        if room_id:
            try:
                queryset = queryset.filter(room_id=int(room_id))
            except (ValueError, TypeError):
                pass
        
        return queryset.order_by('-created_at')


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
        
        # Определяем начальную дату: с момента установки или за указанный период
        if device.installation_date:
            since = device.installation_date
        else:
            since = timezone.now() - timedelta(days=days)
        
        # Получаем существующие метрики только с момента установки
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
    Оплата заказа клиента.
    
    POST: Подтверждает оплату заказа.
    Требует payment_card_id в теле запроса.
    После оплаты:
    - Создает запись Payment
    - Меняет статус заказа на APPROVED
    - Автоматически создаёт DeviceInstance для каждого типа устройства в каждой комнате заказа
    - Связывает созданные устройства с заказом через OrderDevice
    """
    
    @transaction.atomic
    def post(self, request, pk):
        from django.utils import timezone
        from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied
        from decimal import Decimal
        
        try:
            order = CustomerOrder.objects.prefetch_related(
                'order_rooms__room',
                'order_rooms__device_types'
            ).get(pk=pk)
        except CustomerOrder.DoesNotExist:
            raise NotFound('Order not found')
        
        # Проверка прав доступа
        if order.customer != request.user:
            raise PermissionDenied('You do not have permission to pay this order')
        
        # Проверка статуса
        if order.status != CustomerOrder.STATUS_PENDING:
            raise ValidationError(f'Order is not in PENDING status. Current status: {order.status}')
        
        # Получаем карту для оплаты
        payment_card_id = request.data.get('payment_card_id')
        if not payment_card_id:
            raise ValidationError('payment_card_id is required')
        
        try:
            payment_card = PaymentCard.objects.get(pk=payment_card_id, customer=request.user)
        except PaymentCard.DoesNotExist:
            raise NotFound('Payment card not found')
        
        # Вычисляем сумму заказа
        total_amount = order.calculate_total_cost()
        
        # Сохраняем стоимость в заказе, если еще не сохранена
        if not order.total_cost:
            order.total_cost = total_amount
            order.save(update_fields=['total_cost'])
        
        # Создаем запись о платеже
        payment = Payment.objects.create(
            order=order,
            payment_card=payment_card,
            amount=total_amount,
            status=Payment.STATUS_PAID,
            paid_at=timezone.now(),
            transaction_id=f'TXN-ORDER-{order.id}-{timezone.now().strftime("%Y%m%d%H%M%S")}'
        )
        
        # Меняем статус заказа
        order.status = CustomerOrder.STATUS_APPROVED
        order.save()
        
        # Создаем устройства для каждой комнаты в заказе
        created_devices = []
        for order_room in order.order_rooms.all():
            room = order_room.room
            for order_room_device_type in order_room.order_room_device_types.all():
                device_type = order_room_device_type.device_type
                
                # Создаем DeviceInstance со статусом ACTIVE
                device = DeviceInstance.objects.create(
                    device_type=device_type,
                    room=room,
                    customer=order.customer,
                    status=DeviceInstance.STATUS_ACTIVE,
                    is_power_on=True
                )
                created_devices.append(device)
                
                # Связываем устройство с заказом через OrderDevice
                OrderDevice.objects.get_or_create(order=order, device=device)
        
        # Создаем подписку для заказа со статусом SUSPENDED
        # Подписка будет активирована автоматически когда заказ станет ACTIVE (после установки через админку)
        # Ежемесячная стоимость = общая стоимость заказа (разовая установка не включена в подписку)
        monthly_amount = total_amount  # Можно настроить отдельную логику расчета
        
        # Пока заказ не ACTIVE, подписка в статусе SUSPENDED (ожидает активации)
        # start_date и next_payment_date будут установлены при активации
        subscription = Subscription.objects.create(
            customer=order.customer,
            order=order,
            status=Subscription.STATUS_SUSPENDED,  # Ожидает активации заказа
            monthly_amount_usd=monthly_amount,
            start_date=timezone.now(),  # Дата создания, но подписка еще не активна
            next_payment_date=timezone.now() + timedelta(days=30)  # Будет пересчитано при активации
        )
        
        # Возвращаем обновленный заказ с созданными устройствами и подпиской
        order_serializer = CustomerOrderSerializer(order)
        payment_serializer = PaymentSerializer(payment)
        subscription_serializer = SubscriptionSerializer(subscription)
        
        return Response({
            'order': order_serializer.data,
            'payment': payment_serializer.data,
            'subscription': subscription_serializer.data,
            'devices_created': len(created_devices),
            'message': 'Payment confirmed. Devices created successfully. Subscription created and will be activated when order is installed.'
        })


class PaymentCardListView(CustomerMixin, ListMixin, CreateMixin, BaseView):
    """
    Список карт пользователя / Добавить новую карту.
    
    GET: Возвращает список всех карт текущего пользователя.
    POST: Создает новую карту для пользователя.
    """
    serializer_class = PaymentCardSerializer
    queryset = PaymentCard.objects.all()
    check_retrieve_permission = False  # Фильтрация по customer обеспечивает безопасность
    check_create_permission = False  # Отключаем проверку прав для создания - customer уже установлен в сериализаторе
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PaymentCardCreateSerializer
        return PaymentCardSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(customer=self.request.user)
    
    def perform_create(self, serializer):
        return serializer.save()


class PaymentCardDetailView(APIView):
    """
    Детали карты / Обновить карту / Удалить карту.
    
    GET: Возвращает детали карты.
    PATCH: Обновляет данные карты.
    DELETE: Удаляет карту.
    """
    def get(self, request, pk):
        from rest_framework.exceptions import NotFound, PermissionDenied
        
        try:
            card = PaymentCard.objects.get(pk=pk)
        except PaymentCard.DoesNotExist:
            raise NotFound('Payment card not found')
        
        if card.customer != request.user:
            raise PermissionDenied('You do not have permission to view this card')
        
        serializer = PaymentCardSerializer(card)
        return Response(serializer.data)
    
    def patch(self, request, pk):
        from rest_framework.exceptions import NotFound, PermissionDenied
        from django.db import transaction
        
        try:
            card = PaymentCard.objects.get(pk=pk)
        except PaymentCard.DoesNotExist:
            raise NotFound('Payment card not found')
        
        if card.customer != request.user:
            raise PermissionDenied('You do not have permission to update this card')
        
        # Обрабатываем is_default
        if 'is_default' in request.data:
            if request.data.get('is_default', False):
                # Если устанавливается is_default=True, снимаем флаг с других карт
                with transaction.atomic():
                    PaymentCard.objects.filter(customer=request.user, is_default=True).exclude(pk=pk).update(is_default=False)
            # Если is_default=False, просто сохраняем (не нужно ничего делать с другими картами)
        
        serializer = PaymentCardCreateSerializer(card, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(PaymentCardSerializer(card).data)
    
    def delete(self, request, pk):
        from rest_framework.exceptions import NotFound, PermissionDenied
        
        try:
            card = PaymentCard.objects.get(pk=pk)
        except PaymentCard.DoesNotExist:
            raise NotFound('Payment card not found')
        
        if card.customer != request.user:
            raise PermissionDenied('You do not have permission to delete this card')
        
        card.delete()
        return Response({'message': 'Payment card deleted successfully'}, status=204)


class CustomerPaymentListView(ListMixin, BaseView):
    """
    История платежей клиента.
    
    GET: Возвращает список всех платежей текущего клиента с аналитикой.
    """
    serializer_class = PaymentSerializer
    queryset = Payment.objects.select_related('order', 'payment_card').all()
    check_retrieve_permission = False
    
    def get_queryset(self):
        # Не используем CustomerMixin, так как Payment не имеет поля customer
        # Фильтруем через order__customer
        queryset = self.queryset
        return queryset.filter(order__customer=self.request.user).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        from django.db.models import Sum, Count
        from django.utils import timezone
        from datetime import timedelta
        
        response = super().list(request, *args, **kwargs)
        
        # Вычисляем аналитику
        payments = self.get_queryset()
        
        # Общая статистика
        total_paid = payments.filter(status=Payment.STATUS_PAID).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        total_payments = payments.filter(status=Payment.STATUS_PAID).count()
        
        # Статистика за последние 30 дней
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_payments = payments.filter(
            status=Payment.STATUS_PAID,
            created_at__gte=thirty_days_ago
        )
        recent_total = recent_payments.aggregate(total=Sum('amount'))['total'] or 0
        
        # Статистика за последние 7 дней
        seven_days_ago = timezone.now() - timedelta(days=7)
        week_payments = payments.filter(
            status=Payment.STATUS_PAID,
            created_at__gte=seven_days_ago
        )
        week_total = week_payments.aggregate(total=Sum('amount'))['total'] or 0
        
        # Добавляем аналитику в ответ
        response.data['analytics'] = {
            'total_paid': float(total_paid),
            'total_payments': total_payments,
            'recent_30_days': {
                'total': float(recent_total),
                'count': recent_payments.count()
            },
            'recent_7_days': {
                'total': float(week_total),
                'count': week_payments.count()
            }
        }
        
        return response


class CustomerSubscriptionListView(CustomerMixin, ListMixin, BaseView):
    """
    Список подписок клиента.
    
    GET: Возвращает список всех подписок текущего клиента.
    """
    serializer_class = SubscriptionSerializer
    queryset = Subscription.objects.select_related('order', 'customer').prefetch_related(
        'order__order_rooms__room',
        'order__order_rooms__device_types'
    ).all()
    check_retrieve_permission = False


class CustomerSubscriptionCancelView(APIView):
    """
    Отмена подписки клиента.
    
    POST: Отменяет подписку (меняет статус на CANCELLED).
    """
    
    def post(self, request, pk):
        from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied
        
        try:
            subscription = Subscription.objects.select_related('order', 'customer').get(pk=pk)
        except Subscription.DoesNotExist:
            raise NotFound('Subscription not found')
        
        # Проверка прав доступа
        if subscription.customer != request.user:
            raise PermissionDenied('You do not have permission to cancel this subscription')
        
        # Проверка статуса
        if subscription.status != Subscription.STATUS_ACTIVE:
            raise ValidationError(f'Subscription is not active. Current status: {subscription.status}')
        
        # Отменяем подписку
        subscription.status = Subscription.STATUS_CANCELLED
        subscription.cancelled_at = timezone.now()
        subscription.save()
        
        serializer = SubscriptionSerializer(subscription)
        return Response({
            'subscription': serializer.data,
            'message': 'Subscription cancelled successfully'
        })

