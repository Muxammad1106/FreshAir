from django.db import transaction
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny

from users.serializers.register import RegisterSerializer
from users.utils.authentication import sign_in_response


class RegisterView(CreateAPIView):
    """
    Регистрация пользователя (Sign Up).
    
    Универсальная регистрация для клиентов и инвесторов.
    
    **Пример запроса для клиента:**
    ```json
    {
      "email": "customer@example.com",
      "password": "password123",
      "full_name": "Иван Иванов",
      "role": "CUSTOMER",
      "phone": "+998901234567"
    }
    ```
    
    **Пример запроса для инвестора:**
    ```json
    {
      "email": "investor@example.com",
      "password": "password123",
      "full_name": "Дмитрий Кузнецов",
      "role": "INVESTOR",
      "phone": "+998901234567",
      "budget_usd": "5000.00"
    }
    ```
    
    **Обязательные поля:**
    - email: Email пользователя
    - password: Пароль
    - full_name: Полное имя пользователя
    - **role: Роль пользователя (CUSTOMER или INVESTOR) - ОБЯЗАТЕЛЬНО**
    
    **Опциональные поля:**
    - phone: Номер телефона
    - budget_usd: Бюджет инвестора в USD (только для INVESTOR)
    
    **Response 200:**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh": "refresh_token_string",
      "role": "CUSTOMER",
      "user": {
        "id": 1,
        "email": "customer@example.com",
        "first_name": "Иван",
        "last_name": "Иванов",
        "role": "CUSTOMER"
      },
      "permissions": []
    }
    ```
    
    **Важно:** 
    - Поле `role` возвращается как в объекте `user`, так и на верхнем уровне ответа.
    - После регистрации пользователь автоматически авторизуется и получает токен.
    """
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    @transaction.atomic
    def perform_create(self, serializer):
        user = serializer.save()
        return sign_in_response(user)

