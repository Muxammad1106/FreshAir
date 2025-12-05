from rest_framework.response import Response
from rest_framework.views import APIView

from users.serializers.users import UserSerializer


class MeView(APIView):
    """
    Получить профиль текущего пользователя.
    
    Возвращает данные текущего авторизованного пользователя,
    включая его роль (CUSTOMER/INVESTOR) и другую информацию.
    """
    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data
        data['role'] = request.user.role
        return Response(data)

