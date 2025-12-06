from django.contrib import admin

from toolkit.admin import BaseAdmin, AuthorMixin
from core.models import (
    Company,
    CustomerProfile,
    InvestorProfile,
    Room,
    DeviceType,
    DeviceInstance,
    CustomerOrder,
    OrderDevice,
    DeviceMetric,
    Investment,
    Payment,
    PaymentCard,
    InvestmentStatSnapshot
)


@admin.register(Company)
class CompanyAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'name', 'phone', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name', 'phone')
    fields = ('name', 'phone', 'created_at', 'updated_at', 'created_by', 'updated_by')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(CustomerProfile)
class CustomerProfileAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'user', 'phone', 'address', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__email', 'user__username', 'phone', 'address')
    fields = ('user', 'phone', 'address', 'created_at', 'updated_at', 'created_by', 'updated_by')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('user',)


@admin.register(InvestorProfile)
class InvestorProfileAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'user', 'phone', 'budget_usd', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__email', 'user__username', 'phone')
    fields = ('user', 'phone', 'budget_usd', 'created_at', 'updated_at', 'created_by', 'updated_by')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('user',)


@admin.register(Room)
class RoomAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'customer', 'name', 'room_type', 'area_m2', 'ceiling_height_m', 'volume_m3', 'city', 'created_at')
    list_filter = ('room_type', 'city', 'created_at', 'updated_at')
    search_fields = ('name', 'customer__email', 'customer__username', 'address', 'city', 'notes')
    fields = (
        'customer', 'name', 'room_type', 'area_m2', 'ceiling_height_m', 'volume_m3',
        'address', 'city', 'notes', 'created_at', 'updated_at', 'created_by', 'updated_by'
    )
    readonly_fields = ('volume_m3', 'created_at', 'updated_at')
    raw_id_fields = ('customer',)


@admin.register(DeviceType)
class DeviceTypeAdmin(AuthorMixin, BaseAdmin):
    list_display = (
        'id', 'name', 'device_category', 'recommended_max_area_m2', 'recommended_max_volume_m3',
        'power_watts', 'supports_cleaning', 'supports_humidifying', 'supports_aroma', 'created_at'
    )
    list_filter = ('device_category', 'supports_cleaning', 'supports_humidifying', 'supports_aroma', 'created_at')
    search_fields = ('name',)
    fields = (
        'name', 'device_category', 'recommended_max_area_m2', 'recommended_max_volume_m3',
        'power_watts', 'supports_cleaning', 'supports_humidifying', 'supports_aroma',
        'created_at', 'updated_at', 'created_by', 'updated_by'
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(DeviceInstance)
class DeviceInstanceAdmin(AuthorMixin, BaseAdmin):
    list_display = (
        'id', 'device_type', 'room', 'customer', 'status', 'serial_number', 'internal_code',
        'is_power_on', 'installation_date', 'last_service_date', 'created_at'
    )
    list_filter = ('status', 'is_power_on', 'device_type', 'installation_date', 'last_service_date', 'created_at')
    search_fields = (
        'serial_number', 'internal_code', 'device_type__name',
        'customer__email', 'customer__username', 'room__name'
    )
    fields = (
        'device_type', 'room', 'customer', 'status', 'serial_number', 'internal_code',
        'is_power_on', 'installation_date', 'last_service_date',
        'created_at', 'updated_at', 'created_by', 'updated_by'
    )
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('device_type', 'room', 'customer')


class OrderDeviceInline(admin.TabularInline):
    model = OrderDevice
    extra = 1
    raw_id_fields = ('device',)


@admin.register(CustomerOrder)
class CustomerOrderAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'customer', 'room', 'status', 'comment', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('customer__email', 'customer__username', 'room__name', 'comment')
    fields = ('customer', 'room', 'status', 'comment', 'created_at', 'updated_at', 'created_by', 'updated_by')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('customer', 'room')
    inlines = [OrderDeviceInline]


@admin.register(OrderDevice)
class OrderDeviceAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'order', 'device', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('order__id', 'device__serial_number', 'device__internal_code')
    fields = ('order', 'device', 'created_at', 'updated_at', 'created_by', 'updated_by')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('order', 'device')


@admin.register(DeviceMetric)
class DeviceMetricAdmin(AuthorMixin, BaseAdmin):
    list_display = (
        'id', 'device', 'timestamp', 'pm25', 'humidity', 'cleaned_air_volume_m3',
        'filter_wear_percent', 'liquid_level_percent', 'created_at'
    )
    list_filter = ('timestamp', 'created_at', 'updated_at')
    search_fields = ('device__serial_number', 'device__internal_code')
    fields = (
        'device', 'timestamp', 'pm25', 'humidity', 'cleaned_air_volume_m3',
        'filter_wear_percent', 'liquid_level_percent',
        'created_at', 'updated_at', 'created_by', 'updated_by'
    )
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('device',)
    date_hierarchy = 'timestamp'


@admin.register(Investment)
class InvestmentAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'investor', 'device', 'amount_usd', 'status', 'paid_at', 'created_at', 'updated_at')
    list_filter = ('status', 'paid_at', 'created_at', 'updated_at')
    search_fields = (
        'investor__email', 'investor__username', 'device__serial_number',
        'device__internal_code', 'amount_usd'
    )
    fields = ('investor', 'device', 'amount_usd', 'status', 'paid_at', 'created_at', 'updated_at', 'created_by', 'updated_by')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('investor', 'device')


@admin.register(PaymentCard)
class PaymentCardAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'customer', 'cardholder_name', 'card_number_last4', 'brand', 'is_default', 'expiry_month', 'expiry_year', 'created_at')
    list_filter = ('is_default', 'brand', 'created_at', 'updated_at')
    search_fields = ('cardholder_name', 'card_number_last4', 'customer__email', 'customer__username')
    fields = ('customer', 'card_number_last4', 'cardholder_name', 'expiry_month', 'expiry_year', 'is_default', 'brand', 'created_at', 'updated_at', 'created_by', 'updated_by')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('customer',)


@admin.register(Payment)
class PaymentAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'order', 'investment', 'payment_card', 'external_id', 'transaction_id', 'status', 'amount', 'paid_at', 'created_at')
    list_filter = ('status', 'created_at', 'updated_at', 'paid_at')
    search_fields = ('external_id', 'transaction_id', 'order__id', 'investment__id')
    fields = ('order', 'investment', 'payment_card', 'external_id', 'transaction_id', 'status', 'amount', 'paid_at', 'created_at', 'updated_at', 'created_by', 'updated_by')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('order', 'investment', 'payment_card')


@admin.register(InvestmentStatSnapshot)
class InvestmentStatSnapshotAdmin(AuthorMixin, BaseAdmin):
    list_display = (
        'id', 'investment', 'device', 'timestamp', 'cumulative_cleaned_air_volume_m3',
        'cumulative_humidity_hours', 'projected_return_amount', 'projected_return_date', 'created_at'
    )
    list_filter = ('timestamp', 'projected_return_date', 'created_at', 'updated_at')
    search_fields = (
        'investment__id', 'device__serial_number', 'device__internal_code',
        'projected_return_amount'
    )
    fields = (
        'investment', 'device', 'timestamp', 'cumulative_cleaned_air_volume_m3',
        'cumulative_humidity_hours', 'projected_return_amount', 'projected_return_date',
        'created_at', 'updated_at', 'created_by', 'updated_by'
    )
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('investment', 'device')
    date_hierarchy = 'timestamp'

