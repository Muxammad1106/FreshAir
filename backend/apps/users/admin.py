from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from toolkit.admin import BaseAdmin, AuthorMixin
from users.models import User, Token, ResetPassword


@admin.register(User)
class UserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('company', 'role', 'confirmation_code', 'verified_at')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('company', 'role')}),
    )
    list_display = UserAdmin.list_display + ('company', 'role', 'verified_at', 'is_active')
    list_filter = UserAdmin.list_filter + ('role', 'company', 'is_active', 'verified_at')
    search_fields = UserAdmin.search_fields + ('email', 'first_name', 'last_name', 'company__name')
    readonly_fields = UserAdmin.readonly_fields + ('confirmation_code',)


@admin.register(Token)
class TokenAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'user', 'key', 'is_active', 'expires_at', 'created_at', 'updated_at')
    list_filter = ('is_active', 'expires_at', 'created_at')
    search_fields = ('user__email', 'user__username', 'key', 'refresh')
    readonly_fields = ('key', 'refresh', 'created_at', 'updated_at')
    fields = ('user', 'key', 'refresh', 'is_active', 'expires_at', 'created_at', 'updated_at')
    raw_id_fields = ('user',)


@admin.register(ResetPassword)
class ResetPasswordAdmin(AuthorMixin, BaseAdmin):
    list_display = ('id', 'user', 'key', 'expires_at', 'created_at', 'updated_at')
    list_filter = ('expires_at', 'created_at')
    search_fields = ('user__email', 'user__username', 'key')
    readonly_fields = ('key', 'created_at', 'updated_at')
    fields = ('user', 'key', 'expires_at', 'created_at', 'updated_at')
    raw_id_fields = ('user',)
