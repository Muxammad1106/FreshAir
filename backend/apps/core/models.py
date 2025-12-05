from django.db import models
from django.db.models import CASCADE
from decimal import Decimal

from core.querysets.company import CompanyQuerySet
from toolkit.models import BaseModel


class BaseCompanyModel(BaseModel):
    company = models.ForeignKey('core.Company', CASCADE)

    class Meta:
        abstract = True


class Company(BaseModel):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)

    objects = CompanyQuerySet.as_manager()

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'core_companies'


class CustomerProfile(BaseModel):
    user = models.OneToOneField('users.User', CASCADE, related_name='customer_profile')
    phone = models.CharField(max_length=255, null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    def __str__(self):
        return f'Customer: {self.user.email}'

    class Meta:
        db_table = 'core_customer_profiles'


class InvestorProfile(BaseModel):
    user = models.OneToOneField('users.User', CASCADE, related_name='investor_profile')
    phone = models.CharField(max_length=255, null=True, blank=True)
    budget_usd = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    def __str__(self):
        return f'Investor: {self.user.email}'

    class Meta:
        db_table = 'core_investor_profiles'


class Room(BaseModel):
    ROOM_HOME = 'HOME'
    ROOM_COMMERCIAL = 'COMMERCIAL'
    ROOM_INDUSTRIAL = 'INDUSTRIAL'
    ROOM_CHOICES = [
        (ROOM_HOME, 'Home'),
        (ROOM_COMMERCIAL, 'Commercial'),
        (ROOM_INDUSTRIAL, 'Industrial'),
    ]

    customer = models.ForeignKey('users.User', CASCADE, related_name='rooms')
    name = models.CharField(max_length=255)
    room_type = models.CharField(max_length=20, choices=ROOM_CHOICES)
    area_m2 = models.FloatField()
    ceiling_height_m = models.FloatField(null=True, blank=True)
    volume_m3 = models.FloatField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.ceiling_height_m and not self.volume_m3:
            self.volume_m3 = self.area_m2 * self.ceiling_height_m
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} ({self.room_type})'

    class Meta:
        db_table = 'core_rooms'


class DeviceType(BaseModel):
    DEVICE_PURIFIER = 'PURIFIER'
    DEVICE_HUMIDIFIER = 'HUMIDIFIER'
    DEVICE_AROMA = 'AROMA'
    DEVICE_COMBO = 'COMBO'
    DEVICE_CHOICES = [
        (DEVICE_PURIFIER, 'Purifier'),
        (DEVICE_HUMIDIFIER, 'Humidifier'),
        (DEVICE_AROMA, 'Aroma'),
        (DEVICE_COMBO, 'Combo'),
    ]

    name = models.CharField(max_length=255)
    device_category = models.CharField(max_length=20, choices=DEVICE_CHOICES)
    recommended_max_area_m2 = models.FloatField(null=True, blank=True)
    recommended_max_volume_m3 = models.FloatField(null=True, blank=True)
    power_watts = models.FloatField(null=True, blank=True)
    supports_cleaning = models.BooleanField(default=False)
    supports_humidifying = models.BooleanField(default=False)
    supports_aroma = models.BooleanField(default=False)
    price_usd = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), help_text='Цена устройства в USD')

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'core_device_types'


class DeviceInstance(BaseModel):
    STATUS_ORDERED = 'ORDERED'
    STATUS_IN_TRANSIT = 'IN_TRANSIT'
    STATUS_INSTALLING = 'INSTALLING'
    STATUS_ACTIVE = 'ACTIVE'
    STATUS_DISABLED = 'DISABLED'
    STATUS_MAINTENANCE = 'MAINTENANCE'
    STATUS_CHOICES = [
        (STATUS_ORDERED, 'Ordered'),
        (STATUS_IN_TRANSIT, 'In Transit'),
        (STATUS_INSTALLING, 'Installing'),
        (STATUS_ACTIVE, 'Active'),
        (STATUS_DISABLED, 'Disabled'),
        (STATUS_MAINTENANCE, 'Maintenance'),
    ]

    device_type = models.ForeignKey(DeviceType, CASCADE, related_name='instances')
    room = models.ForeignKey(Room, CASCADE, related_name='devices', null=True, blank=True)
    customer = models.ForeignKey('users.User', CASCADE, related_name='customer_devices', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ORDERED)
    serial_number = models.CharField(max_length=255, unique=True, null=True, blank=True)
    internal_code = models.CharField(max_length=255, null=True, blank=True)
    is_power_on = models.BooleanField(default=True)
    installation_date = models.DateTimeField(null=True, blank=True)
    last_service_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.device_type.name} - {self.serial_number or self.internal_code}'

    class Meta:
        db_table = 'core_device_instances'


class CustomerOrder(BaseModel):
    STATUS_PENDING = 'PENDING'
    STATUS_APPROVED = 'APPROVED'
    STATUS_INSTALLED = 'INSTALLED'
    STATUS_ACTIVE = 'ACTIVE'
    STATUS_CANCELLED = 'CANCELLED'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_INSTALLED, 'Installed'),
        (STATUS_ACTIVE, 'Active'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    customer = models.ForeignKey('users.User', CASCADE, related_name='orders')
    room = models.ForeignKey(Room, CASCADE, related_name='orders', null=True, blank=True)  # Для обратной совместимости
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    comment = models.TextField(null=True, blank=True)
    devices = models.ManyToManyField(DeviceInstance, through='OrderDevice', related_name='orders')
    rooms = models.ManyToManyField(Room, through='OrderRoom', related_name='order_rooms')

    def __str__(self):
        return f'Order #{self.id} - {self.customer.email}'

    class Meta:
        db_table = 'core_customer_orders'


class OrderDevice(BaseModel):
    order = models.ForeignKey(CustomerOrder, CASCADE, related_name='order_devices')
    device = models.ForeignKey(DeviceInstance, CASCADE, related_name='order_devices')

    def __str__(self):
        return f'{self.order} - {self.device}'

    class Meta:
        db_table = 'core_order_devices'
        unique_together = [['order', 'device']]


class OrderRoom(BaseModel):
    order = models.ForeignKey(CustomerOrder, CASCADE, related_name='order_rooms')
    room = models.ForeignKey(Room, CASCADE, related_name='order_room_relations')
    device_types = models.ManyToManyField(DeviceType, through='OrderRoomDeviceType', related_name='order_room_device_types')

    def __str__(self):
        return f'{self.order} - {self.room}'

    class Meta:
        db_table = 'core_order_rooms'
        unique_together = [['order', 'room']]


class OrderRoomDeviceType(BaseModel):
    order_room = models.ForeignKey(OrderRoom, CASCADE, related_name='order_room_device_types')
    device_type = models.ForeignKey(DeviceType, CASCADE, related_name='order_room_device_type_relations')

    def __str__(self):
        return f'{self.order_room} - {self.device_type}'

    class Meta:
        db_table = 'core_order_room_device_types'
        unique_together = [['order_room', 'device_type']]


class DeviceMetric(BaseModel):
    device = models.ForeignKey(DeviceInstance, CASCADE, related_name='metrics')
    timestamp = models.DateTimeField()
    pm25 = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    cleaned_air_volume_m3 = models.FloatField(null=True, blank=True)
    filter_wear_percent = models.FloatField(null=True, blank=True)
    liquid_level_percent = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f'{self.device} - {self.timestamp}'

    class Meta:
        db_table = 'core_device_metrics'
        ordering = ['-timestamp']


class Investment(BaseModel):
    STATUS_PENDING = 'PENDING'
    STATUS_PAID = 'PAID'
    STATUS_FAILED = 'FAILED'
    STATUS_CANCELLED = 'CANCELLED'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_PAID, 'Paid'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    investor = models.ForeignKey('users.User', CASCADE, related_name='investments')
    device = models.ForeignKey(DeviceInstance, CASCADE, related_name='investments')
    amount_usd = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'Investment #{self.id} - {self.investor.email} - {self.amount_usd} USD'

    class Meta:
        db_table = 'core_investments'


class Payment(BaseModel):
    STATUS_PENDING = 'PENDING'
    STATUS_PAID = 'PAID'
    STATUS_FAILED = 'FAILED'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_PAID, 'Paid'),
        (STATUS_FAILED, 'Failed'),
    ]

    investment = models.OneToOneField(Investment, CASCADE, related_name='payment')
    external_id = models.CharField(max_length=255, null=True, blank=True)
    transaction_id = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f'Payment #{self.id} - {self.investment}'

    class Meta:
        db_table = 'core_payments'


class InvestmentStatSnapshot(BaseModel):
    investment = models.ForeignKey(Investment, CASCADE, related_name='stat_snapshots', null=True, blank=True)
    device = models.ForeignKey(DeviceInstance, CASCADE, related_name='stat_snapshots', null=True, blank=True)
    timestamp = models.DateTimeField()
    cumulative_cleaned_air_volume_m3 = models.FloatField(default=0.0)
    cumulative_humidity_hours = models.FloatField(default=0.0)
    projected_return_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    projected_return_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f'Snapshot - {self.timestamp}'

    class Meta:
        db_table = 'core_investment_stat_snapshots'
        ordering = ['-timestamp']
