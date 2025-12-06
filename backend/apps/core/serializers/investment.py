from rest_framework import serializers
from toolkit.utils.serializers import BaseModelSerializer
from core.models import Investment, DeviceInstance, DeviceMetric
from core.serializers.device import DeviceInstanceSerializer


class InvestmentSerializer(BaseModelSerializer):
    device = DeviceInstanceSerializer(read_only=True)
    device_id = serializers.IntegerField(write_only=True, required=True)
    cleaned_air_m3 = serializers.SerializerMethodField()
    humidified_hours = serializers.SerializerMethodField()
    projected_return_usd = serializers.SerializerMethodField()
    projected_return_date = serializers.SerializerMethodField()
    
    def validate_device_id(self, value):
        """Проверяем, что устройство существует и активно"""
        try:
            device = DeviceInstance.objects.get(pk=value, status=DeviceInstance.STATUS_ACTIVE)
        except DeviceInstance.DoesNotExist:
            raise serializers.ValidationError("Устройство не найдено или не активно")
        return value

    def get_cleaned_air_m3(self, obj):
        from django.db.models import Sum
        total = DeviceMetric.objects.filter(device=obj.device).aggregate(
            total=Sum('cleaned_air_volume_m3')
        )['total'] or 0
        return total

    def get_humidified_hours(self, obj):
        from django.db.models import Count
        count = DeviceMetric.objects.filter(device=obj.device, humidity__isnull=False).count()
        return count

    def get_projected_return_usd(self, obj):
        snapshot = obj.stat_snapshots.order_by('-timestamp').first()
        return snapshot.projected_return_amount if snapshot else None

    def get_projected_return_date(self, obj):
        snapshot = obj.stat_snapshots.order_by('-timestamp').first()
        return snapshot.projected_return_date if snapshot else None

    def create(self, validated_data):
        device_id = validated_data.pop('device_id')
        device = DeviceInstance.objects.get(pk=device_id)
        validated_data['device'] = device
        return super().create(validated_data)

    class Meta:
        model = Investment
        fields = ('id', 'device', 'device_id', 'amount_usd', 'status', 'paid_at', 'cleaned_air_m3', 'humidified_hours', 'projected_return_usd', 'projected_return_date', 'created_at')
        read_only_fields = ('id', 'device', 'status', 'paid_at', 'created_at', 'cleaned_air_m3', 'humidified_hours', 'projected_return_usd', 'projected_return_date')


class AvailableDeviceSerializer(DeviceInstanceSerializer):
    min_investment_usd = serializers.SerializerMethodField()
    max_investment_usd = serializers.SerializerMethodField()
    short_projection = serializers.SerializerMethodField()

    def get_min_investment_usd(self, obj):
        return obj.device_type.min_investment_usd

    def get_max_investment_usd(self, obj):
        return obj.device_type.max_investment_usd

    def get_short_projection(self, obj):
        from decimal import Decimal
        # Используем процент прибыли из типа устройства
        profit_percentage = float(obj.device_type.investment_profit_percentage)
        period_months = obj.device_type.investment_period_months
        # Для расчета используем минимальную инвестицию как базу
        base_investment = obj.device_type.min_investment_usd
        projected_return = base_investment * (Decimal(str(profit_percentage)) / Decimal('100'))
        return {
            'projected_return_usd': str(projected_return),
            'period_months': period_months,
            'profit_percentage': profit_percentage
        }

    class Meta(DeviceInstanceSerializer.Meta):
        fields = DeviceInstanceSerializer.Meta.fields + ('min_investment_usd', 'max_investment_usd', 'short_projection')

