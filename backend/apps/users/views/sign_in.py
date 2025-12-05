from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny

from users.serializers.sign_in import SignInSerializer
from users.utils.authentication import sign_in_response


class SignInView(GenericAPIView):
    """
    Вход в систему.
    
    Универсальный вход для клиентов и инвесторов.
    Принимает email и password, возвращает токен и данные пользователя с ролью.
    """
    permission_classes = (AllowAny,)
    serializer_class = SignInSerializer

    def post(self, request):
        serializer = self.serializer_class.check(request)
        return sign_in_response(serializer['user'])
