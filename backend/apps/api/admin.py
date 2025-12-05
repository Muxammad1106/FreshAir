from django.contrib import admin

from toolkit.admin import BaseAdmin, AuthorMixin
from api.models import Customer, Investor, DeviceModels, Device, CustomerDevice


@admin.register(Customer)
class CustomerAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'name', 'phone', 'user', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name', 'phone', 'user__email', 'user__username')
    fields = ('name', 'phone', 'user', 'created_at', 'updated_at', 'created_by', 'updated_by')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('user',)


@admin.register(Investor)
class InvestorAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'name', 'phone', 'user', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name', 'phone', 'user__email', 'user__username')
    fields = ('name', 'phone', 'user', 'created_at', 'updated_at', 'created_by', 'updated_by')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('user',)


@admin.register(DeviceModels)
class DeviceModelsAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'name', 'type', 'square', 'rent_price', 'created_at', 'updated_at')
    list_filter = ('type', 'created_at', 'updated_at')
    search_fields = ('name',)
    fields = ('name', 'type', 'square', 'rent_price', 'created_at', 'updated_at', 'created_by', 'updated_by')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Device)
class DeviceAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'model', 'rent_price', 'investor', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('model__name', 'investor__name', 'investor__user__email')
    fields = ('model', 'rent_price', 'investor', 'created_at', 'updated_at', 'created_by', 'updated_by')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('model', 'investor')


@admin.register(CustomerDevice)
class CustomerDeviceAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'customer', 'device', 'stopped_at', 'created_at', 'updated_at')
    list_filter = ('stopped_at', 'created_at', 'updated_at')
    search_fields = ('customer__name', 'customer__user__email', 'device__model__name')
    fields = ('customer', 'device', 'stopped_at', 'created_at', 'updated_at', 'created_by', 'updated_by')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('customer', 'device')
    date_hierarchy = 'stopped_at'

