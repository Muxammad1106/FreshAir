from django.urls import path

from core.views.company import CompanyView
from core.views.configurations import ConfigurationsView
from core.views.general import GeneralView
from core.views.customer import (
    RoomListView,
    CustomerOrderListView,
    CustomerDeviceListView,
    DeviceToggleView,
    DeviceMetricsView,
    DeviceTypeListView,
    CustomerOrderPayView,
    PaymentCardListView,
    PaymentCardDetailView,
    CustomerPaymentListView,
    CustomerSubscriptionListView,
    CustomerSubscriptionCancelView
)
from core.views.investor import (
    InvestorDashboardView,
    AvailableDevicesView,
    InvestmentListView,
    ConfirmPaymentView
)
from core.views.admin import (
    AdminDeviceView,
    AdminDeviceStatusView,
    InternalDeviceMetricsView
)

urlpatterns = [
    path('configurations', ConfigurationsView.as_view()),
    path('general', GeneralView.as_view()),
    path('company', CompanyView.as_view()),
    path('customer/rooms', RoomListView.as_view(), name='customer-rooms'),
    path('customer/device-types', DeviceTypeListView.as_view(), name='customer-device-types'),
    path('customer/orders', CustomerOrderListView.as_view(), name='customer-orders'),
    path('customer/orders/<int:pk>/pay', CustomerOrderPayView.as_view(), name='customer-order-pay'),
    path('customer/devices', CustomerDeviceListView.as_view(), name='customer-devices'),
    path('customer/devices/<int:pk>/toggle', DeviceToggleView.as_view(), name='device-toggle'),
    path('customer/devices/<int:pk>/metrics', DeviceMetricsView.as_view(), name='device-metrics'),
    path('customer/payment-cards', PaymentCardListView.as_view(), name='customer-payment-cards'),
    path('customer/payment-cards/<int:pk>', PaymentCardDetailView.as_view(), name='customer-payment-card-detail'),
    path('customer/payments', CustomerPaymentListView.as_view(), name='customer-payments'),
    path('customer/subscriptions', CustomerSubscriptionListView.as_view(), name='customer-subscriptions'),
    path('customer/subscriptions/<int:pk>/cancel', CustomerSubscriptionCancelView.as_view(), name='customer-subscription-cancel'),
    path('investor/dashboard', InvestorDashboardView.as_view(), name='investor-dashboard'),
    path('investor/devices/available', AvailableDevicesView.as_view(), name='investor-devices-available'),
    path('investor/investments', InvestmentListView.as_view(), name='investor-investments'),
    path('investor/investments/<int:pk>/confirm-payment', ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('admin/devices', AdminDeviceView.as_view(), name='admin-devices'),
    path('admin/devices/<int:pk>', AdminDeviceView.as_view(), name='admin-device-detail'),
    path('admin/devices/<int:pk>/status', AdminDeviceStatusView.as_view(), name='admin-device-status'),
    path('internal/devices/<int:pk>/metrics', InternalDeviceMetricsView.as_view(), name='internal-device-metrics'),
]
