from toolkit.views import BaseView, RetrieveMixin, UpdateMixin, UpdatePartialMixin
from core.serializers.company import CompanySerializer

class CompanyMixin:
    def perform_create(self, serializer):
        serializer.validated_data['company'] = self.request.user.company
        super().perform_create(serializer)

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.filter(company=self.request.user.company)
        return queryset


class CompanyView(UpdatePartialMixin, RetrieveMixin, BaseView):
    serializer_class = CompanySerializer

    def get_object(self):
        return self.request.user.company
