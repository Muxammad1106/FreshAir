from rest_framework import serializers
from django.db import models
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
    # Для записи: принимаем данные комнаты и список услуг
    name = serializers.CharField(write_only=True, required=False)
    room_type = serializers.CharField(write_only=True, required=False)
    area_m2 = serializers.FloatField(write_only=True, required=False)
    ceiling_height_m = serializers.FloatField(write_only=True, required=False, allow_null=True)
    address = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    notes = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    # Новые поля для услуг
    services = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
        help_text='Список услуг: cleaning, humidifying, aroma'
    )
    # Старое поле для обратной совместимости
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
            'id', 'room', 'room_id', 'device_types', 'device_type_ids', 'services',
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
        from django.db import transaction
        import logging
        
        logger = logging.getLogger(__name__)
        
        # Убираем rooms_data из validated_data, так как это не поле модели
        rooms_data = validated_data.pop('rooms_data', None)
        
        logger.info(f'Creating order with {len(rooms_data) if rooms_data else 0} rooms')
        
        # ВСЕ операции в одной транзакции, чтобы гарантировать атомарность
        with transaction.atomic():
            # Создаем ОДИН заказ
            order = CustomerOrder.objects.create(**validated_data)
            logger.info(f'Order {order.id} created')
            
            # Обработка нового формата с несколькими комнатами
            if rooms_data:
                logger.info(f'Processing {len(rooms_data)} rooms for order {order.id}')
                for idx, room_data in enumerate(rooms_data):
                    # Создаем копию, чтобы не изменять исходные данные
                    room_data_copy = room_data.copy()
                    
                    # Получаем услуги (новый формат) или device_type_ids (старый формат для обратной совместимости)
                    services = room_data_copy.pop('services', [])
                    device_type_ids = room_data_copy.pop('device_type_ids', [])
                    
                    logger.info(f'Processing room {idx + 1}/{len(rooms_data)}: {room_data_copy.get("name", "unnamed")}')
                    logger.info(f'Services: {services}, Device type IDs: {device_type_ids}')
                    
                    # Создаем комнату
                    room_serializer = RoomSerializer(data=room_data_copy)
                    room_serializer.is_valid(raise_exception=True)
                    room = room_serializer.save(customer=validated_data['customer'])
                    logger.info(f'Room {room.id} created for order {order.id}')
                    
                    # Создаем OrderRoom - связь между заказом и комнатой
                    order_room = OrderRoom.objects.create(order=order, room=room)
                    logger.info(f'OrderRoom {order_room.id} created linking order {order.id} to room {room.id}')
                    
                    # Если указаны услуги, автоматически подбираем девайсы
                    if services:
                        device_type_ids = self._select_devices_by_services(services, room.area_m2, logger)
                        logger.info(f'Selected device types for services {services}: {device_type_ids}')
                    
                    # Создаем связи с типами устройств
                    for device_type_id in device_type_ids:
                        try:
                            device_type = DeviceType.objects.get(pk=device_type_id)
                            OrderRoomDeviceType.objects.create(
                                order_room=order_room,
                                device_type=device_type
                            )
                            logger.info(f'DeviceType {device_type_id} linked to OrderRoom {order_room.id}')
                        except DeviceType.DoesNotExist:
                            from rest_framework.exceptions import ValidationError
                            raise ValidationError(f'DeviceType with id {device_type_id} does not exist')
            
            logger.info(f'Order {order.id} creation completed with {order.order_rooms.count()} rooms')
            return order
    
    def _select_devices_by_services(self, services, area_m2, logger):
        """
        Автоматически подбирает девайсы на основе выбранных услуг и площади.
        
        Логика:
        - cleaning (очистка) -> нужен PURIFIER или COMBO
        - humidifying (увлажнение) -> нужен HUMIDIFIER или COMBO
        - aroma (арома) -> нужен AROMA или COMBO
        - Если выбраны cleaning + humidifying -> арома добавляется автоматически (в подарок)
        - Выбираем девайсы с coverage_area_m2 >= area_m2
        """
        from core.models import DeviceType
        
        selected_device_ids = []
        needs_cleaning = 'cleaning' in services
        needs_humidifying = 'humidifying' in services
        needs_aroma = 'aroma' in services
        
        # Если выбраны cleaning + humidifying, арома добавляется автоматически
        if needs_cleaning and needs_humidifying:
            needs_aroma = True
            logger.info('Cleaning + Humidifying selected, aroma added as gift')
        
        # Пытаемся найти COMBO девайс, который покрывает все нужные услуги
        if needs_cleaning and needs_humidifying:
            combo_devices = DeviceType.objects.filter(
                device_category=DeviceType.DEVICE_COMBO,
                supports_cleaning=True,
                supports_humidifying=True,
                supports_aroma=needs_aroma
            ).filter(
                models.Q(coverage_area_m2__gte=area_m2) | models.Q(coverage_area_m2__isnull=True)
            ).order_by('coverage_area_m2')
            
            if combo_devices.exists():
                selected_device_ids.append(combo_devices.first().id)
                logger.info(f'Selected COMBO device {combo_devices.first().id} for area {area_m2} m²')
                return selected_device_ids
        
        # Если COMBO не найден, подбираем отдельные девайсы
        if needs_cleaning:
            purifier_devices = DeviceType.objects.filter(
                device_category=DeviceType.DEVICE_PURIFIER,
                supports_cleaning=True
            ).filter(
                models.Q(coverage_area_m2__gte=area_m2) | models.Q(coverage_area_m2__isnull=True)
            ).order_by('coverage_area_m2')
            
            if purifier_devices.exists():
                selected_device_ids.append(purifier_devices.first().id)
                logger.info(f'Selected PURIFIER device {purifier_devices.first().id} for area {area_m2} m²')
        
        if needs_humidifying:
            humidifier_devices = DeviceType.objects.filter(
                device_category=DeviceType.DEVICE_HUMIDIFIER,
                supports_humidifying=True
            ).filter(
                models.Q(coverage_area_m2__gte=area_m2) | models.Q(coverage_area_m2__isnull=True)
            ).order_by('coverage_area_m2')
            
            if humidifier_devices.exists():
                selected_device_ids.append(humidifier_devices.first().id)
                logger.info(f'Selected HUMIDIFIER device {humidifier_devices.first().id} for area {area_m2} m²')
        
        if needs_aroma:
            aroma_devices = DeviceType.objects.filter(
                device_category=DeviceType.DEVICE_AROMA,
                supports_aroma=True
            ).filter(
                models.Q(coverage_area_m2__gte=area_m2) | models.Q(coverage_area_m2__isnull=True)
            ).order_by('coverage_area_m2')
            
            if aroma_devices.exists():
                selected_device_ids.append(aroma_devices.first().id)
                logger.info(f'Selected AROMA device {aroma_devices.first().id} for area {area_m2} m²')
        
        return selected_device_ids

    class Meta:
        model = CustomerOrder
        fields = (
            'id', 'room', 'room_id', 'rooms', 'rooms_data',
            'status', 'comment', 'created_at', 'devices'
        )
        read_only_fields = ('id', 'status', 'created_at', 'devices')

