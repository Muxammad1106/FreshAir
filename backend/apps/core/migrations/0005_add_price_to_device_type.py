# Generated manually

from django.db import migrations, models
from decimal import Decimal


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_alter_customerorder_room_orderroom_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='devicetype',
            name='price_usd',
            field=models.DecimalField(decimal_places=2, default=Decimal('0.00'), help_text='Цена устройства в USD', max_digits=10),
        ),
    ]

