from django.db import models
from toolkit.models import BaseModel
from users.models import User


class Customer(BaseModel):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    user = models.OneToOneField(User, models.CASCADE)

    class Meta:
        db_table = 'api_customers'


class Investor(BaseModel):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    user = models.OneToOneField(User, models.CASCADE)

    class Meta:
        db_table = 'api_investors'


class DeviceModels(BaseModel):
    CONDITIONER = 'conditioner'
    PURIFIER = 'purifier'
    HUMIDIFIER = 'humidifier'
    SENSOR = 'sensor'
    AROMA = 'aroma'

    DEVICE_TYPES = {
        (CONDITIONER, 'Air Conditioner'),
        (PURIFIER, 'Air Purifier'),
        (HUMIDIFIER, 'Air Humidifier'),
        (SENSOR, 'Air Quality Sensor'),
        (AROMA, 'Aroma'),
    }
    
    name = models.CharField(max_length=255)
    square = models.DecimalField(max_digits=10, decimal_places=2)
    rent_price = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(choices=DEVICE_TYPES, max_length=255)

    class Meta:
        db_table = 'api_device_models'


class Device(BaseModel):
    model = models.ForeignKey(DeviceModels, models.CASCADE)
    rent_price = models.DecimalField(max_digits=10, decimal_places=2)
    investor = models.ForeignKey(Investor, models.CASCADE)

    class Meta:
        db_table = 'api_devices'


class CustomerDevice(BaseModel):
    customer = models.ForeignKey(Customer, models.CASCADE)
    device = models.ForeignKey(Device, models.CASCADE)
    stopped_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'api_customer_devices'
