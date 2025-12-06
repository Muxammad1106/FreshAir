from django.db.models import Sum, Q
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from toolkit.views import BaseView, CreateMixin, ListMixin
from core.models import Investment, DeviceInstance, DeviceMetric, InvestmentStatSnapshot
from core.serializers.investment import InvestmentSerializer, AvailableDeviceSerializer


class InvestorMixin:
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(investor=self.request.user)


class InvestorDashboardView(APIView):
    """
    Дашборд инвестора.
    
    Возвращает общую сводку по инвестициям инвестора:
    - Общая сумма инвестиций (USD)
    - Количество активных устройств
    - Общий объём очищенного воздуха (м³)
    - Общее количество часов увлажнения
    - Прогнозируемый общий доход (USD)
    - Дата прогнозируемого возврата
    """
    def get(self, request):
        investments = Investment.objects.filter(
            investor=request.user,
            status=Investment.STATUS_PAID
        ).select_related('device', 'device__device_type', 'device__room')

        total_invested = investments.aggregate(total=Sum('amount_usd'))['total'] or 0
        active_devices_count = investments.values('device').distinct().count()

        device_ids = investments.values_list('device_id', flat=True)
        total_cleaned_air = DeviceMetric.objects.filter(
            device_id__in=device_ids
        ).aggregate(total=Sum('cleaned_air_volume_m3'))['total'] or 0

        total_humidified_hours = DeviceMetric.objects.filter(
            device_id__in=device_ids,
            humidity__isnull=False
        ).count()

        latest_snapshot = InvestmentStatSnapshot.objects.filter(
            investment__investor=request.user
        ).order_by('-timestamp').first()

        projected_return_total = latest_snapshot.projected_return_amount if latest_snapshot else 0
        projected_return_date = latest_snapshot.projected_return_date if latest_snapshot else None

        return Response({
            'total_invested_usd': str(total_invested),
            'active_devices_count': active_devices_count,
            'total_cleaned_air_m3': total_cleaned_air,
            'total_humidified_hours': total_humidified_hours,
            'projected_return_total_usd': str(projected_return_total),
            'projected_return_date': projected_return_date.isoformat() if projected_return_date else None
        })


class AvailableDevicesView(ListMixin, BaseView):
    """
    Список доступных устройств для инвестиций.
    
    Возвращает устройства, в которые можно вложиться.
    Поддерживает фильтрацию по бюджету через query параметр ?budget=500.
    
    Для каждого устройства отображается:
    - ID устройства и название типа
    - Местоположение (город, адрес)
    - Минимальная и максимальная сумма инвестиции
    - Текущий уровень PM2.5
    - Краткий прогноз доходности
    """
    serializer_class = AvailableDeviceSerializer
    queryset = DeviceInstance.objects.filter(status=DeviceInstance.STATUS_ACTIVE).select_related('device_type', 'room').prefetch_related('metrics')
    check_retrieve_permission = False  # Отключаем проверку прав, так как это публичный список для инвесторов

    def get_queryset(self):
        queryset = super().get_queryset()
        budget = self.request.query_params.get('budget')
        if budget:
            try:
                from decimal import Decimal
                budget_decimal = Decimal(str(budget))
                # Фильтруем устройства, у которых минимальная инвестиция меньше или равна бюджету
                queryset = queryset.filter(
                    device_type__min_investment_usd__lte=budget_decimal
                )
            except (ValueError, TypeError):
                pass
        return queryset.distinct()


class InvestmentListView(InvestorMixin, ListMixin, CreateMixin, BaseView):
    """
    Список инвестиций инвестора / Создать инвестицию.
    
    GET: Возвращает все инвестиции текущего инвестора с агрегированными показателями по каждому устройству.
    
    POST: Создаёт новую инвестицию в выбранное устройство.
    Инвестиция создаётся со статусом PENDING и требует подтверждения оплаты.
    """
    serializer_class = InvestmentSerializer
    queryset = Investment.objects.select_related('device', 'device__device_type', 'device__room').prefetch_related('stat_snapshots').order_by('-created_at')
    check_retrieve_permission = False  # Фильтрация по investor обеспечивает безопасность
    check_create_permission = False  # Проверяем только что пользователь - инвестор

    def perform_create(self, serializer):
        serializer.validated_data['investor'] = self.request.user
        serializer.validated_data['status'] = Investment.STATUS_PENDING
        return serializer.save()


class ConfirmPaymentView(APIView):
    """
    Подтвердить оплату инвестиции (фейковый платёж).
    
    На странице оплаты инвестор нажимает кнопку "Я оплатил".
    Бекенд меняет статус инвестиции с PENDING на PAID и устанавливает дату оплаты.
    Для прототипа это фейковый платёж без реальной интеграции с платёжными системами.
    """
    def post(self, request, pk):
        try:
            investment = Investment.objects.get(pk=pk, investor=request.user)
        except Investment.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound()
        
        if investment.status != Investment.STATUS_PENDING:
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Investment is not in PENDING status')
        
        investment.status = Investment.STATUS_PAID
        investment.paid_at = timezone.now()
        investment.save()
        
        serializer = InvestmentSerializer(investment)
        return Response(serializer.data)

