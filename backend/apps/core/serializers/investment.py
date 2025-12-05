from rest_framework import serializers
from toolkit.utils.serializers import BaseModelSerializer
from core.models import Investment, DeviceInstance, DeviceMetric
from core.serializers.device import DeviceInstanceSerializer


class InvestmentSerializer(BaseModelSerializer):
    device = DeviceInstanceSerializer(read_only=True)
    cleaned_air_m3 = serializers.SerializerMethodField()
    humidified_hours = serializers.SerializerMethodField()
    projected_return_usd = serializers.SerializerMethodField()
    projected_return_date = serializers.SerializerMethodField()

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

    class Meta:
        model = Investment
        fields = ('id', 'device', 'amount_usd', 'status', 'paid_at', 'cleaned_air_m3', 'humidified_hours', 'projected_return_usd', 'projected_return_date', 'created_at')
        read_only_fields = ('id', 'status', 'paid_at', 'created_at', 'cleaned_air_m3', 'humidified_hours', 'projected_return_usd', 'projected_return_date')


class AvailableDeviceSerializer(DeviceInstanceSerializer):
    min_investment_usd = serializers.SerializerMethodField()
    max_investment_usd = serializers.SerializerMethodField()
    short_projection = serializers.SerializerMethodField()

    def get_min_investment_usd(self, obj):
        from decimal import Decimal
        return Decimal('100.00')

    def get_max_investment_usd(self, obj):
        from decimal import Decimal
        return Decimal('500.00')

    def get_short_projection(self, obj):
        from decimal import Decimal
        return {
            'projected_return_usd': str(Decimal('25.00')),
            'period_months': 6
        }

    class Meta(DeviceInstanceSerializer.Meta):
        fields = DeviceInstanceSerializer.Meta.fields + ('min_investment_usd', 'max_investment_usd', 'short_projection')

