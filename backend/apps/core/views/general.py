from rest_framework.response import Response
from rest_framework.views import APIView
from core.serializers.company import CompanySerializer


class GeneralView(APIView):
    def get(self, request):
        company = CompanySerializer(request.user.company).data
        return Response({'company': company})
