# Generated manually
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_add_investment_fields_to_device_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='devicetype',
            name='coverage_area_m2',
            field=models.FloatField(null=True, blank=True, help_text='Площадь покрытия устройства в м²'),
        ),
    ]

