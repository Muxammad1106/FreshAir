from rest_framework import serializers
from toolkit.utils.serializers import BaseModelSerializer
from core.models import Room


class RoomSerializer(BaseModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'name', 'room_type', 'area_m2', 'ceiling_height_m', 'volume_m3', 'address', 'city', 'notes', 'created_at')
        read_only_fields = ('id', 'created_at', 'volume_m3')

