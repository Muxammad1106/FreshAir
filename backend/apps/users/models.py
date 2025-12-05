import uuid

from django.contrib.auth.models import AbstractUser
from toolkit.models import BaseModel
from django.db import models

from toolkit.utils.jwt import jwt_encode
from users.querysets.token import TokenQuerySet
from users.querysets.user import UsersManager
from users.utils import tokens
from users.utils.fields import expires_default, expires_hour


class User(AbstractUser):
    ROLE_CUSTOMER = 'CUSTOMER'
    ROLE_INVESTOR = 'INVESTOR'
    ROLE_CHOICES = [
        (ROLE_CUSTOMER, 'Customer'),
        (ROLE_INVESTOR, 'Investor'),
    ]

    email = models.EmailField(unique=True)
    confirmation_code = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    company = models.ForeignKey('core.Company', models.CASCADE, null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, null=True, blank=True)
    objects = UsersManager()

    class Meta(AbstractUser.Meta):
        db_table = 'user_users'
        app_label = 'users'


class Token(BaseModel):
    key = models.CharField(max_length=500, unique=True)
    refresh = models.CharField(max_length=500, unique=True, default=tokens.generate)
    is_active = models.BooleanField(default=True)
    user = models.ForeignKey(User, models.CASCADE, related_name='tokens')
    expires_at = models.DateTimeField(default=expires_default)  # token expires in 30 days

    objects = TokenQuerySet.as_manager()

    def __str__(self):
        return self.key

    class Meta:
        db_table = 'user_tokens'


class ResetPassword(BaseModel):
    key = models.CharField(max_length=40, unique=True)
    user = models.ForeignKey(User, models.CASCADE)
    expires_at = models.DateTimeField(default=expires_hour)

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = tokens.generate()
        return super(ResetPassword, self).save(*args, **kwargs)

    def __str__(self):
        return self.key

    class Meta:
        db_table = 'user_reset_password'
