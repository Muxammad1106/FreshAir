from rest_framework import serializers
from core.models import PaymentCard, Payment
from toolkit.utils.serializers import BaseModelSerializer


class PaymentCardSerializer(BaseModelSerializer):
    """
    Сериализатор для банковских карт пользователя.
    """
    class Meta:
        model = PaymentCard
        fields = (
            'id', 'card_number_last4', 'cardholder_name', 'expiry_month', 'expiry_year',
            'is_default', 'brand', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class PaymentCardCreateSerializer(BaseModelSerializer):
    """
    Сериализатор для создания новой карты.
    """
    card_number = serializers.CharField(write_only=True, max_length=19, help_text='Полный номер карты (будет сохранен только последние 4 цифры)')
    cvv = serializers.CharField(write_only=True, max_length=4, help_text='CVV код (не сохраняется)')
    
    class Meta:
        model = PaymentCard
        fields = (
            'id', 'card_number', 'cardholder_name', 'expiry_month', 'expiry_year',
            'cvv', 'is_default', 'brand', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def validate_card_number(self, value):
        """Валидация номера карты"""
        # Удаляем пробелы и дефисы
        cleaned = value.replace(' ', '').replace('-', '')
        if not cleaned.isdigit():
            raise serializers.ValidationError('Номер карты должен содержать только цифры')
        if len(cleaned) < 13 or len(cleaned) > 19:
            raise serializers.ValidationError('Номер карты должен содержать от 13 до 19 цифр')
        return cleaned
    
    def validate_expiry_month(self, value):
        """Валидация месяца истечения"""
        if value < 1 or value > 12:
            raise serializers.ValidationError('Месяц должен быть от 1 до 12')
        return value
    
    def validate_expiry_year(self, value):
        """Валидация года истечения"""
        from datetime import datetime
        current_year = datetime.now().year
        if value < current_year or value > current_year + 20:
            raise serializers.ValidationError(f'Год должен быть от {current_year} до {current_year + 20}')
        return value
    
    def create(self, validated_data):
        """Создание карты с сохранением только последних 4 цифр"""
        from django.db import transaction
        
        card_number = validated_data.pop('card_number')
        validated_data.pop('cvv', None)  # CVV не сохраняем
        
        # Сохраняем только последние 4 цифры
        validated_data['card_number_last4'] = card_number[-4:]
        
        # Определяем бренд карты по первой цифре
        first_digit = card_number[0]
        if first_digit == '4':
            validated_data['brand'] = 'Visa'
        elif first_digit == '5' or (first_digit == '2' and len(card_number) == 16):
            validated_data['brand'] = 'Mastercard'
        elif first_digit == '3':
            validated_data['brand'] = 'American Express'
        else:
            validated_data['brand'] = 'Unknown'
        
        # Если это первая карта пользователя или is_default=True, делаем её картой по умолчанию
        customer = self.context['request'].user
        with transaction.atomic():
            if validated_data.get('is_default', False) or not PaymentCard.objects.filter(customer=customer).exists():
                # Снимаем флаг is_default с других карт
                PaymentCard.objects.filter(customer=customer, is_default=True).update(is_default=False)
                validated_data['is_default'] = True
            
            validated_data['customer'] = customer
            return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Обновление карты с обработкой полного номера карты"""
        from django.db import transaction
        
        # Если передан полный номер карты, обрабатываем его
        if 'card_number' in validated_data:
            card_number = validated_data.pop('card_number')
            validated_data['card_number_last4'] = card_number[-4:]
            
            # Определяем бренд карты по первой цифре
            first_digit = card_number[0]
            if first_digit == '4':
                validated_data['brand'] = 'Visa'
            elif first_digit == '5' or (first_digit == '2' and len(card_number) == 16):
                validated_data['brand'] = 'Mastercard'
            elif first_digit == '3':
                validated_data['brand'] = 'American Express'
            else:
                validated_data['brand'] = 'Unknown'
        
        # Обрабатываем is_default
        if 'is_default' in validated_data:
            if validated_data.get('is_default', False):
                # Если устанавливается is_default=True, снимаем флаг с других карт
                with transaction.atomic():
                    PaymentCard.objects.filter(customer=instance.customer, is_default=True).exclude(pk=instance.pk).update(is_default=False)
            # Если is_default=False, просто сохраняем (не нужно ничего делать с другими картами)
        
        validated_data.pop('cvv', None)  # CVV не сохраняем
        return super().update(instance, validated_data)


class PaymentSerializer(BaseModelSerializer):
    """
    Сериализатор для платежей.
    """
    payment_card = PaymentCardSerializer(read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    investment_id = serializers.IntegerField(source='investment.id', read_only=True)
    
    class Meta:
        model = Payment
        fields = (
            'id', 'order', 'order_id', 'investment', 'investment_id', 'payment_card',
            'external_id', 'transaction_id', 'status', 'amount', 'paid_at',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'status', 'paid_at', 'created_at', 'updated_at')

