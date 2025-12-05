from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny

from users.serializers.sign_in import SignInSerializer
from users.utils.authentication import sign_in_response


class SignInView(GenericAPIView):
    """
    Вход в систему (Sign In).
    
    Универсальный вход для клиентов и инвесторов.
    
    **Пример запроса:**
    ```json
    {
      "email": "customer@example.com",
      "password": "password123"
    }
    ```
    
    **Request body:**
    - email: Email пользователя (обязательно)
    - password: Пароль (обязательно)
    
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
    - Роль определяется автоматически на основе данных пользователя в базе.
    - Возможные значения роли: `CUSTOMER` или `INVESTOR`.
    - Используйте полученный `token` в заголовке `Authorization: Token {token}` для доступа к защищённым эндпоинтам.
    """
    permission_classes = (AllowAny,)
    serializer_class = SignInSerializer

    def post(self, request):
        serializer = self.serializer_class.check(request)
        return sign_in_response(serializer['user'])
