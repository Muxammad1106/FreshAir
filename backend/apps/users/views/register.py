from django.db import transaction
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny

from users.serializers.register import RegisterSerializer
from users.utils.authentication import sign_in_response


class RegisterView(CreateAPIView):
    """
    Регистрация пользователя.
    
    Универсальная регистрация для клиентов и инвесторов.
    Роль определяется полем 'role' (CUSTOMER или INVESTOR).
    После регистрации пользователь автоматически авторизуется и получает токен.
    """
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    @transaction.atomic
    def perform_create(self, serializer):
        user = serializer.save()
        return sign_in_response(user)

