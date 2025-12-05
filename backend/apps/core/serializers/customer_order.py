from rest_framework import serializers
from toolkit.utils.serializers import BaseModelSerializer
from core.models import CustomerOrder, Room
from core.serializers.room import RoomSerializer


class CustomerOrderSerializer(BaseModelSerializer):
    room = RoomSerializer(read_only=True)
    room_id = serializers.PrimaryKeyRelatedField(queryset=Room.objects.all(), source='room', write_only=True)
    comment = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CustomerOrder
        fields = ('id', 'room', 'room_id', 'status', 'comment', 'created_at')
        read_only_fields = ('id', 'status', 'created_at')

