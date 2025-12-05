from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from toolkit.views import BaseView, CreateMixin, UpdatePartialMixin
from core.models import DeviceInstance
from core.serializers.device import DeviceInstanceSerializer


class AdminDeviceView(CreateMixin, UpdatePartialMixin, BaseView):
    """
    Создать / обновить устройство (админ).
    
    POST: Создаёт новое физическое устройство.
    Менеджер/админ создаёт устройство, привязывает к заказу/помещению, устанавливает статус.
    
    PATCH: Обновляет информацию об устройстве (серийный номер, статус, привязка к помещению и т.д.).
    """
    serializer_class = DeviceInstanceSerializer
    queryset = DeviceInstance.objects.all()
    check_create_permission = False
    check_update_permission = False


class AdminDeviceStatusView(APIView):
    """
    Изменить статус устройства.
    
    Позволяет менеджеру изменить статус устройства.
    Статусы: ORDERED → IN_TRANSIT → INSTALLING → ACTIVE.
    Также поддерживаются статусы: DISABLED, MAINTENANCE.
    """
    def patch(self, request, pk):
        try:
            device = DeviceInstance.objects.get(pk=pk)
        except DeviceInstance.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound()
        
        new_status = request.data.get('status')
        if new_status not in dict(DeviceInstance.STATUS_CHOICES):
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Invalid status')
        
        device.status = new_status
        device.save()
        
        serializer = DeviceInstanceSerializer(device)
        return Response(serializer.data)


class InternalDeviceMetricsView(APIView):
    """
    Приём метрик от устройства (IoT).
    
    Внутренний эндпоинт для приёма данных с устройств.
    Устройство (или симулятор) отправляет текущие значения сенсоров.
    
    Создаёт запись DeviceMetric с метриками:
    - PM2.5 (уровень загрязнения)
    - Влажность
    - Объём очищенного воздуха (м³)
    - Износ фильтров (%)
    - Уровень жидкости в увлажнителе (%)
    
    Если timestamp не указан, используется текущее время.
    """
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            device = DeviceInstance.objects.get(pk=pk)
        except DeviceInstance.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound()
        
        from core.models import DeviceMetric
        from core.serializers.device import DeviceMetricSerializer
        
        data = request.data.copy()
        data['device'] = device.id
        if 'timestamp' not in data:
            data['timestamp'] = timezone.now()
        
        serializer = DeviceMetricSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        metric = serializer.save()
        
        return Response(DeviceMetricSerializer(metric).data)

