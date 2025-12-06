# Generated manually

from django.db import migrations, models
from decimal import Decimal


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_add_price_to_device_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='devicetype',
            name='min_investment_usd',
            field=models.DecimalField(decimal_places=2, default=Decimal('100.00'), help_text='Минимальная сумма инвестиции в USD', max_digits=10),
        ),
        migrations.AddField(
            model_name='devicetype',
            name='max_investment_usd',
            field=models.DecimalField(decimal_places=2, default=Decimal('1000.00'), help_text='Максимальная сумма инвестиции в USD', max_digits=10),
        ),
        migrations.AddField(
            model_name='devicetype',
            name='investment_profit_percentage',
            field=models.FloatField(default=25.0, help_text='Процент прибыли за период (например, 25% за 6 месяцев)'),
        ),
        migrations.AddField(
            model_name='devicetype',
            name='investment_period_months',
            field=models.IntegerField(default=6, help_text='Период инвестиции в месяцах'),
        ),
    ]

