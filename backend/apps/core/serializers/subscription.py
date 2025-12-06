from rest_framework import serializers
from toolkit.utils.serializers import BaseModelSerializer
from core.models import Subscription
from core.serializers.customer_order import CustomerOrderSerializer


class SubscriptionSerializer(BaseModelSerializer):
    order = CustomerOrderSerializer(read_only=True)
    order_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Subscription
        fields = (
            'id',
            'order',
            'order_id',
            'status',
            'monthly_amount_usd',
            'start_date',
            'next_payment_date',
            'cancelled_at',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'order',
            'order_id',
            'start_date',
            'next_payment_date',
            'created_at',
            'updated_at',
        )

