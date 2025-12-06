from rest_framework import serializers
from toolkit.utils.serializers import BaseModelSerializer
from core.models import CustomerOrder, Room, OrderRoom, OrderRoomDeviceType, DeviceType
from core.serializers.room import RoomSerializer
from core.serializers.device import DeviceTypeSerializer, DeviceInstanceSerializer


class OrderRoomDeviceTypeSerializer(BaseModelSerializer):
    device_type = DeviceTypeSerializer(read_only=True)
    device_type_id = serializers.PrimaryKeyRelatedField(queryset=DeviceType.objects.all(), source='device_type', write_only=True)

    class Meta:
        model = OrderRoomDeviceType
        fields = ('id', 'device_type', 'device_type_id')
        read_only_fields = ('id',)


class OrderRoomSerializer(BaseModelSerializer):
    room = RoomSerializer(read_only=True)
    device_types = serializers.SerializerMethodField()
    # Для записи: принимаем данные комнаты и список ID типов устройств
    name = serializers.CharField(write_only=True, required=False)
    room_type = serializers.CharField(write_only=True, required=False)
    area_m2 = serializers.FloatField(write_only=True, required=False)
    ceiling_height_m = serializers.FloatField(write_only=True, required=False, allow_null=True)
    address = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    notes = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    device_type_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    room_id = serializers.PrimaryKeyRelatedField(
        queryset=Room.objects.all(),
        source='room',
        write_only=True,
        required=False,
        allow_null=True
    )

    def get_device_types(self, obj):
        # obj - это OrderRoom, получаем типы устройств через ManyToMany связь
        device_types = obj.device_types.all()
        return DeviceTypeSerializer(device_types, many=True).data

    class Meta:
        model = OrderRoom
        fields = (
            'id', 'room', 'room_id', 'device_types', 'device_type_ids',
            'name', 'room_type', 'area_m2', 'ceiling_height_m',
            'address', 'city', 'notes'
        )
        read_only_fields = ('id',)


class CustomerOrderSerializer(BaseModelSerializer):
    room = RoomSerializer(read_only=True)
    room_id = serializers.PrimaryKeyRelatedField(
        queryset=Room.objects.all(),
        source='room',
        write_only=True,
        required=False,
        allow_null=True
    )
    rooms = serializers.SerializerMethodField()
    devices = DeviceInstanceSerializer(many=True, read_only=True)
    comment = serializers.CharField(required=False, allow_blank=True)
    # Для создания заказа с несколькими комнатами
    rooms_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )

    def get_rooms(self, obj):
        # Получаем OrderRoom объекты, а не Room
        order_rooms = obj.order_rooms.all()
        return OrderRoomSerializer(order_rooms, many=True).data

    def create(self, validated_data):
        # Убираем rooms_data из validated_data, так как это не поле модели
        rooms_data = validated_data.pop('rooms_data', None)
        
        # Создаем заказ
        order = CustomerOrder.objects.create(**validated_data)
        
        # Обработка нового формата с несколькими комнатами
        if rooms_data:
            from django.db import transaction
            with transaction.atomic():
                for room_data in rooms_data:
                    device_type_ids = room_data.pop('device_type_ids', [])
                    
                    # Создаем комнату
                    room_serializer = RoomSerializer(data=room_data)
                    room_serializer.is_valid(raise_exception=True)
                    room = room_serializer.save(customer=validated_data['customer'])
                    
                    # Создаем OrderRoom
                    order_room = OrderRoom.objects.create(order=order, room=room)
                    
                    # Создаем связи с типами устройств
                    for device_type_id in device_type_ids:
                        try:
                            device_type = DeviceType.objects.get(pk=device_type_id)
                            OrderRoomDeviceType.objects.create(
                                order_room=order_room,
                                device_type=device_type
                            )
                        except DeviceType.DoesNotExist:
                            from rest_framework.exceptions import ValidationError
                            raise ValidationError(f'DeviceType with id {device_type_id} does not exist')
        
        return order

    class Meta:
        model = CustomerOrder
        fields = (
            'id', 'room', 'room_id', 'rooms', 'rooms_data',
            'status', 'comment', 'created_at', 'devices'
        )
        read_only_fields = ('id', 'status', 'created_at', 'devices')

