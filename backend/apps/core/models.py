from django.db import models
from django.db.models import CASCADE
from decimal import Decimal

from core.querysets.company import CompanyQuerySet
from toolkit.models import BaseModel


class BaseCompanyModel(BaseModel):
    company = models.ForeignKey("core.Company", CASCADE)

    class Meta:
        abstract = True


class Company(BaseModel):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)

    objects = CompanyQuerySet.as_manager()

    def __str__(self):
        return self.name

    class Meta:
        db_table = "core_companies"


class CustomerProfile(BaseModel):
    user = models.OneToOneField("users.User", CASCADE, related_name="customer_profile")
    phone = models.CharField(max_length=255, null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Customer: {self.user.email}"

    class Meta:
        db_table = "core_customer_profiles"


class InvestorProfile(BaseModel):
    user = models.OneToOneField("users.User", CASCADE, related_name="investor_profile")
    phone = models.CharField(max_length=255, null=True, blank=True)
    budget_usd = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00")
    )

    def __str__(self):
        return f"Investor: {self.user.email}"

    class Meta:
        db_table = "core_investor_profiles"


class Room(BaseModel):
    ROOM_HOME = "HOME"
    ROOM_COMMERCIAL = "COMMERCIAL"
    ROOM_INDUSTRIAL = "INDUSTRIAL"
    ROOM_CHOICES = [
        (ROOM_HOME, "Home"),
        (ROOM_COMMERCIAL, "Commercial"),
        (ROOM_INDUSTRIAL, "Industrial"),
    ]

    customer = models.ForeignKey("users.User", CASCADE, related_name="rooms")
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
        return f"{self.name} ({self.room_type})"

    class Meta:
        db_table = "core_rooms"


class DeviceType(BaseModel):
    DEVICE_PURIFIER = "PURIFIER"
    DEVICE_HUMIDIFIER = "HUMIDIFIER"
    DEVICE_AROMA = "AROMA"
    DEVICE_COMBO = "COMBO"
    DEVICE_CHOICES = [
        (DEVICE_PURIFIER, "Purifier"),
        (DEVICE_HUMIDIFIER, "Humidifier"),
        (DEVICE_AROMA, "Aroma"),
        (DEVICE_COMBO, "Combo"),
    ]

    name = models.CharField(max_length=255)
    device_category = models.CharField(max_length=20, choices=DEVICE_CHOICES)
    recommended_max_area_m2 = models.FloatField(null=True, blank=True)
    recommended_max_volume_m3 = models.FloatField(null=True, blank=True)
    coverage_area_m2 = models.FloatField(
        null=True, blank=True, help_text="Площадь покрытия устройства в м²"
    )
    power_watts = models.FloatField(null=True, blank=True)
    supports_cleaning = models.BooleanField(default=False)
    supports_humidifying = models.BooleanField(default=False)
    supports_aroma = models.BooleanField(default=False)
    price_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Цена устройства в USD",
    )
    # Поля для инвестиций
    min_investment_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("100.00"),
        help_text="Минимальная сумма инвестиции в USD",
    )
    max_investment_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("1000.00"),
        help_text="Максимальная сумма инвестиции в USD",
    )
    investment_profit_percentage = models.FloatField(
        default=25.0, help_text="Процент прибыли за период (например, 25% за 6 месяцев)"
    )
    investment_period_months = models.IntegerField(
        default=6, help_text="Период инвестиции в месяцах"
    )

    def __str__(self):
        return self.name

    class Meta:
        db_table = "core_device_types"


class DeviceInstance(BaseModel):
    STATUS_ORDERED = "ORDERED"
    STATUS_IN_TRANSIT = "IN_TRANSIT"
    STATUS_INSTALLING = "INSTALLING"
    STATUS_ACTIVE = "ACTIVE"
    STATUS_DISABLED = "DISABLED"
    STATUS_MAINTENANCE = "MAINTENANCE"
    STATUS_CHOICES = [
        (STATUS_ORDERED, "Ordered"),
        (STATUS_IN_TRANSIT, "In Transit"),
        (STATUS_INSTALLING, "Installing"),
        (STATUS_ACTIVE, "Active"),
        (STATUS_DISABLED, "Disabled"),
        (STATUS_MAINTENANCE, "Maintenance"),
    ]

    device_type = models.ForeignKey(DeviceType, CASCADE, related_name="instances")
    room = models.ForeignKey(
        Room, CASCADE, related_name="devices", null=True, blank=True
    )
    customer = models.ForeignKey(
        "users.User", CASCADE, related_name="customer_devices", null=True, blank=True
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_ORDERED
    )
    serial_number = models.CharField(max_length=255, unique=True, null=True, blank=True)
    internal_code = models.CharField(max_length=255, null=True, blank=True)
    is_power_on = models.BooleanField(default=True)
    installation_date = models.DateTimeField(null=True, blank=True)
    last_service_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.device_type.name} - {self.serial_number or self.internal_code}"

    class Meta:
        db_table = "core_device_instances"


class CustomerOrder(BaseModel):
    STATUS_PENDING = "PENDING"
    STATUS_APPROVED = "APPROVED"
    STATUS_INSTALLED = "INSTALLED"
    STATUS_ACTIVE = "ACTIVE"
    STATUS_CANCELLED = "CANCELLED"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_INSTALLED, "Installed"),
        (STATUS_ACTIVE, "Active"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    customer = models.ForeignKey("users.User", CASCADE, related_name="orders")
    room = models.ForeignKey(
        Room, CASCADE, related_name="orders", null=True, blank=True
    )  # Для обратной совместимости
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING
    )
    comment = models.TextField(null=True, blank=True)
    total_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Общая стоимость заказа",
    )
    devices = models.ManyToManyField(
        DeviceInstance, through="OrderDevice", related_name="orders"
    )
    rooms = models.ManyToManyField(
        Room, through="OrderRoom", related_name="order_rooms"
    )

    def save(self, *args, **kwargs):
        """
        Переопределяем save для автоматической активации подписки при изменении статуса заказа на ACTIVE.
        """
        # Сохраняем старый статус для проверки
        old_status = None
        if self.pk:
            try:
                old_order = CustomerOrder.objects.get(pk=self.pk)
                old_status = old_order.status
            except CustomerOrder.DoesNotExist:
                pass

        # Сохраняем заказ
        super().save(*args, **kwargs)

        # Если статус изменился на ACTIVE, активируем подписку
        if old_status != self.status and self.status == self.STATUS_ACTIVE:
            self._activate_subscription()

    def _activate_subscription(self):
        """
        Активирует подписку для этого заказа, если она существует.
        """
        from django.utils import timezone
        from datetime import timedelta

        try:
            subscription = self.subscription
            if subscription and subscription.status == Subscription.STATUS_SUSPENDED:
                subscription.status = Subscription.STATUS_ACTIVE
                subscription.start_date = timezone.now()
                subscription.next_payment_date = timezone.now() + timedelta(days=30)
                subscription.save(
                    update_fields=["status", "start_date", "next_payment_date"]
                )
        except Subscription.DoesNotExist:
            pass

    def calculate_total_cost(self):
        """
        Рассчитывает общую стоимость заказа на основе комнат и услуг.
        Логика: 0.10 USD за м³ для очистки/увлажнения, 0.05 USD за м³ для арома.
        """
        from decimal import Decimal

        total = Decimal("0.00")

        for order_room in self.order_rooms.all():
            room = order_room.room
            volume_m3 = Decimal(str(room.volume_m3 or 0))

            # Получаем услуги из OrderRoomDeviceType (определяем по типам устройств)
            has_cleaning = False
            has_humidifying = False
            has_aroma = False

            for order_room_device_type in order_room.order_room_device_types.all():
                device_type = order_room_device_type.device_type
                if device_type.supports_cleaning:
                    has_cleaning = True
                if device_type.supports_humidifying:
                    has_humidifying = True
                if device_type.supports_aroma:
                    has_aroma = True

            # Если есть и cleaning, и humidifying, арома добавляется автоматически
            if has_cleaning and has_humidifying:
                has_aroma = True

            # Расчет стоимости
            if has_cleaning:
                total += volume_m3 * Decimal("0.10")
            if has_humidifying:
                total += volume_m3 * Decimal("0.10")
            if has_aroma and not (has_cleaning and has_humidifying):
                # Арома отдельно только если не в подарок
                total += volume_m3 * Decimal("0.05")

        return total

    def __str__(self):
        return f"Order #{self.id} - {self.customer.email}"

    class Meta:
        db_table = "core_customer_orders"


class OrderDevice(BaseModel):
    order = models.ForeignKey(CustomerOrder, CASCADE, related_name="order_devices")
    device = models.ForeignKey(DeviceInstance, CASCADE, related_name="order_devices")

    def __str__(self):
        return f"{self.order} - {self.device}"

    class Meta:
        db_table = "core_order_devices"
        unique_together = [["order", "device"]]


class OrderRoom(BaseModel):
    order = models.ForeignKey(CustomerOrder, CASCADE, related_name="order_rooms")
    room = models.ForeignKey(Room, CASCADE, related_name="order_room_relations")
    device_types = models.ManyToManyField(
        DeviceType,
        through="OrderRoomDeviceType",
        related_name="order_room_device_types",
    )

    def __str__(self):
        return f"{self.order} - {self.room}"

    class Meta:
        db_table = "core_order_rooms"
        unique_together = [["order", "room"]]


class OrderRoomDeviceType(BaseModel):
    order_room = models.ForeignKey(
        OrderRoom, CASCADE, related_name="order_room_device_types"
    )
    device_type = models.ForeignKey(
        DeviceType, CASCADE, related_name="order_room_device_type_relations"
    )

    def __str__(self):
        return f"{self.order_room} - {self.device_type}"

    class Meta:
        db_table = "core_order_room_device_types"
        unique_together = [["order_room", "device_type"]]


class DeviceMetric(BaseModel):
    device = models.ForeignKey(DeviceInstance, CASCADE, related_name="metrics")
    timestamp = models.DateTimeField()
    pm25 = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    cleaned_air_volume_m3 = models.FloatField(null=True, blank=True)
    filter_wear_percent = models.FloatField(null=True, blank=True)
    liquid_level_percent = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.device} - {self.timestamp}"

    class Meta:
        db_table = "core_device_metrics"
        ordering = ["-timestamp"]


class Investment(BaseModel):
    STATUS_PENDING = "PENDING"
    STATUS_PAID = "PAID"
    STATUS_FAILED = "FAILED"
    STATUS_CANCELLED = "CANCELLED"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_PAID, "Paid"),
        (STATUS_FAILED, "Failed"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    investor = models.ForeignKey("users.User", CASCADE, related_name="investments")
    device = models.ForeignKey(DeviceInstance, CASCADE, related_name="investments")
    amount_usd = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING
    )
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Investment #{self.id} - {self.investor.email} - {self.amount_usd} USD"

    class Meta:
        db_table = "core_investments"


class PaymentCard(BaseModel):
    """
    Банковская карта пользователя для оплаты заказов.
    """

    customer = models.ForeignKey("users.User", CASCADE, related_name="payment_cards")
    card_number_last4 = models.CharField(
        max_length=4, help_text="Последние 4 цифры карты"
    )
    cardholder_name = models.CharField(max_length=255, help_text="Имя держателя карты")
    expiry_month = models.IntegerField(help_text="Месяц истечения (1-12)")
    expiry_year = models.IntegerField(help_text="Год истечения (например, 2025)")
    is_default = models.BooleanField(default=False, help_text="Карта по умолчанию")
    brand = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Бренд карты (Visa, Mastercard, etc.)",
    )

    def __str__(self):
        return f"{self.cardholder_name} - ****{self.card_number_last4}"

    class Meta:
        db_table = "core_payment_cards"
        ordering = ["-is_default", "-created_at"]


class Payment(BaseModel):
    STATUS_PENDING = "PENDING"
    STATUS_PAID = "PAID"
    STATUS_FAILED = "FAILED"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_PAID, "Paid"),
        (STATUS_FAILED, "Failed"),
    ]

    # Связь с инвестицией (для инвесторов)
    investment = models.OneToOneField(
        Investment, CASCADE, related_name="payment", null=True, blank=True
    )
    # Связь с заказом (для клиентов)
    order = models.ForeignKey(
        CustomerOrder, CASCADE, related_name="payments", null=True, blank=True
    )
    # Карта, которой была произведена оплата
    payment_card = models.ForeignKey(
        PaymentCard, CASCADE, related_name="payments", null=True, blank=True
    )

    external_id = models.CharField(max_length=255, null=True, blank=True)
    transaction_id = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        if self.investment:
            return f"Payment #{self.id} - Investment #{self.investment.id} - {self.amount} USD"
        if self.order:
            return f"Payment #{self.id} - Order #{self.order.id} - {self.amount} USD"
        return f"Payment #{self.id} - {self.amount} USD"

    class Meta:
        db_table = "core_payments"


class InvestmentStatSnapshot(BaseModel):
    investment = models.ForeignKey(
        Investment, CASCADE, related_name="stat_snapshots", null=True, blank=True
    )
    device = models.ForeignKey(
        DeviceInstance, CASCADE, related_name="stat_snapshots", null=True, blank=True
    )
    timestamp = models.DateTimeField()
    cumulative_cleaned_air_volume_m3 = models.FloatField(default=0.0)
    cumulative_humidity_hours = models.FloatField(default=0.0)
    projected_return_amount = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    projected_return_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Snapshot - {self.timestamp}"

    class Meta:
        db_table = "core_investment_stat_snapshots"
        ordering = ["-timestamp"]


class Subscription(BaseModel):
    """
    Подписка клиента на обслуживание устройств после оплаты заказа.
    Создается автоматически после оплаты заказа.
    """

    STATUS_ACTIVE = "ACTIVE"
    STATUS_CANCELLED = "CANCELLED"
    STATUS_EXPIRED = "EXPIRED"
    STATUS_SUSPENDED = "SUSPENDED"
    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_CANCELLED, "Cancelled"),
        (STATUS_EXPIRED, "Expired"),
        (STATUS_SUSPENDED, "Suspended"),
    ]

    customer = models.ForeignKey("users.User", CASCADE, related_name="subscriptions")
    order = models.OneToOneField(CustomerOrder, CASCADE, related_name="subscription")
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_SUSPENDED
    )
    monthly_amount_usd = models.DecimalField(
        max_digits=12, decimal_places=2, help_text="Сумма ежемесячного платежа в USD"
    )
    start_date = models.DateTimeField(help_text="Дата начала подписки")
    next_payment_date = models.DateTimeField(help_text="Дата следующего платежа")
    cancelled_at = models.DateTimeField(
        null=True, blank=True, help_text="Дата отмены подписки"
    )

    def __str__(self):
        return (
            f"Subscription #{self.id} - Order #{self.order.id} - {self.customer.email}"
        )

    class Meta:
        db_table = "core_subscriptions"
        ordering = ["-created_at"]
