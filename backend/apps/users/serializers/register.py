from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from users.models import User


class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True, help_text='Полное имя пользователя')
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True, help_text='Номер телефона (опционально)')
    role = serializers.ChoiceField(choices=[User.ROLE_CUSTOMER, User.ROLE_INVESTOR], help_text='Роль пользователя: CUSTOMER или INVESTOR')
    budget_usd = serializers.DecimalField(write_only=True, max_digits=12, decimal_places=2, required=False, default=0, help_text='Бюджет инвестора в USD (только для INVESTOR)')

    def validate_email(self, email):
        User.objects.remove_unverified(email)
        return email.lower()

    def validate(self, attrs):
        role = attrs.get('role')
        budget_usd = attrs.get('budget_usd', 0)
        
        if role == User.ROLE_INVESTOR and budget_usd == 0:
            attrs['budget_usd'] = 0
        
        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop('full_name', '')
        phone = validated_data.pop('phone', '')
        role = validated_data.pop('role')
        budget_usd = validated_data.pop('budget_usd', 0)
        
        validated_data['email'] = validated_data['email'].lower()
        validated_data['username'] = validated_data['email']
        validated_data['role'] = role
        validated_data['is_active'] = True

        name_parts = full_name.split(' ', 1)
        validated_data['first_name'] = name_parts[0] if name_parts else ''
        validated_data['last_name'] = name_parts[1] if len(name_parts) > 1 else ''

        user = User.objects.create_user(**validated_data)

        if role == User.ROLE_CUSTOMER:
            if phone:
                from core.models import CustomerProfile
                CustomerProfile.objects.create(user=user, phone=phone)
        elif role == User.ROLE_INVESTOR:
            from core.models import InvestorProfile
            InvestorProfile.objects.create(user=user, phone=phone, budget_usd=budget_usd)

        return user

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'full_name', 'phone', 'role', 'budget_usd')
        extra_kwargs = {
            'email': {
                'required': True,
                'validators': [UniqueValidator(
                    queryset=User.objects.unique_query(),
                    message="User with this email already exists."
                )]
            },
            'password': {'write_only': True, 'required': True},
        }

