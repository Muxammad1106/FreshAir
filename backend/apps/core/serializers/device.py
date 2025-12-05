from rest_framework import serializers
from toolkit.utils.serializers import BaseModelSerializer
from core.models import DeviceInstance, DeviceType, DeviceMetric


class DeviceTypeSerializer(BaseModelSerializer):
    class Meta:
        model = DeviceType
        fields = ('id', 'name', 'device_category', 'recommended_max_area_m2', 'recommended_max_volume_m3', 'power_watts', 'supports_cleaning', 'supports_humidifying', 'supports_aroma')
        read_only_fields = ('id',)


class DeviceMetricSerializer(BaseModelSerializer):
    class Meta:
        model = DeviceMetric
        fields = ('id', 'device', 'timestamp', 'pm25', 'humidity', 'cleaned_air_volume_m3', 'filter_wear_percent', 'liquid_level_percent')
        read_only_fields = ('id',)


class DeviceInstanceSerializer(BaseModelSerializer):
    device_type = DeviceTypeSerializer(read_only=True)
    room = serializers.SerializerMethodField()
    is_power_on = serializers.BooleanField(default=True)
    last_metric = serializers.SerializerMethodField()

    def get_room(self, obj):
        if obj.room:
            from core.serializers.room import RoomSerializer
            return RoomSerializer(obj.room).data
        return None

    def get_last_metric(self, obj):
        last_metric = obj.metrics.order_by('-timestamp').first()
        if last_metric:
            return DeviceMetricSerializer(last_metric).data
        return None

    class Meta:
        model = DeviceInstance
        fields = ('id', 'device_type', 'room', 'status', 'serial_number', 'internal_code', 'is_power_on', 'last_metric', 'installation_date', 'last_service_date')
        read_only_fields = ('id', 'installation_date', 'last_service_date')

