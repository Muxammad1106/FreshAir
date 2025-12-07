import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { alpha } from '@mui/material/styles';
// components
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
// hooks
import { useGet, useDelete } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';
// components
import { PaymentMethodCard } from './payment-method-card';
import { PaymentCardModal } from '../orders/payment-card-modal';
import { EditPaymentCardModal } from './edit-payment-card-modal';
import { TransactionHistory } from './transaction-history';
import { PaymentAnalytics } from './payment-analytics';
import { PaymentCharts } from './payment-charts';
// types
import { PaymentMethod, Transaction, PaymentAnalyticsData, getPaymentMethodLabel, PaymentMethodType, TransactionType } from './types';

// ----------------------------------------------------------------------

export default function ClientPaymentPage() {
  const settings = useSettingsContext();
  const [currentTab, setCurrentTab] = useState(0);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PaymentMethod | null>(null);

  // Load cards
  const { data: cardsData, execute: loadCards } = useGet<any[], any>(
    API_ENDPOINTS.core.customer.paymentCards,
    {
      transformResponse: (response) => {
        const { data } = response;
        if (Array.isArray(data)) {
          return data;
        }
        if (data && typeof data === 'object' && 'results' in data) {
          return (data as any).results || [];
        }
        return [];
      },
    }
  );

  // Use useRef to store loadCards function to avoid infinite loops
  const loadCardsRef = useRef(loadCards);
  loadCardsRef.current = loadCards;

  // Stable function for loading cards
  const loadCardsStable = useCallback(() => {
    loadCardsRef.current({ url: API_ENDPOINTS.core.customer.paymentCards });
  }, []);

  // Load cards on mount
  useEffect(() => {
    loadCardsStable();
  }, [loadCardsStable]);

  // Load payments with analytics
  const { data: paymentsData, execute: loadPayments, loading: paymentsLoading, error: paymentsError } = useGet<any, any>(
    API_ENDPOINTS.core.customer.payments,
    {
      transformResponse: (response) => {
        const { data } = response;
        // Debug information
        console.log('Payments API Response:', data);
        return data;
      },
      onError: (error) => {
        console.error('Payments API Error:', error);
      },
    }
  );

  // Use useRef to store loadPayments function to avoid infinite loops
  const loadPaymentsRef = useRef(loadPayments);
  loadPaymentsRef.current = loadPayments;

  // Stable function for loading payments
  const loadPaymentsStable = useCallback(() => {
    loadPaymentsRef.current({ url: API_ENDPOINTS.core.customer.payments });
  }, []);

  // Update payments on page focus (if user returned to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (currentTab === 1) {
        loadPaymentsStable();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentTab, loadPaymentsStable]);

  // Convert cards from API to PaymentMethod format
  const paymentMethods = useMemo<PaymentMethod[]>(() => {
    if (!cardsData) return [];
    return cardsData.map((card) => ({
      id: card.id,
      type: (card.brand || 'Unknown') as PaymentMethodType,
      last4: card.card_number_last4,
      cardholder_name: card.cardholder_name,
      expiry_month: card.expiry_month,
      expiry_year: card.expiry_year,
      is_default: card.is_default,
      brand: card.brand,
      created_at: card.created_at,
    }));
  }, [cardsData]);

  // Convert payments from API to Transaction format
  const transactions = useMemo<Transaction[]>(() => {
    console.log('Processing paymentsData:', paymentsData);
    if (!paymentsData) {
      console.log('No paymentsData');
      return [];
    }
    // Check different possible response formats
    const results = paymentsData.results || paymentsData.data || (Array.isArray(paymentsData) ? paymentsData : []);
    if (!results || results.length === 0) {
      console.log('No results in paymentsData');
      return [];
    }
    console.log('Found', results.length, 'payments');
    return results.map((payment: any) => {
      // order can be ID (number) or object depending on serialization
      const orderId = payment.order_id || (typeof payment.order === 'number' ? payment.order : payment.order?.id) || null;
      
      return {
      id: payment.id,
      type: 'PAYMENT' as TransactionType,
      status: payment.status === 'PAID' ? 'COMPLETED' : payment.status,
        amount: parseFloat(payment.amount || 0),
        amount_usd: parseFloat(payment.amount || 0),
        description: orderId ? `Payment for order #${orderId}` : 'Payment',
      payment_card: payment.payment_card ? {
        brand: payment.payment_card.brand,
        card_number_last4: payment.payment_card.card_number_last4,
      } : undefined,
      payment_method: payment.payment_card ? {
        type: (payment.payment_card.brand || 'Unknown') as PaymentMethodType,
        last4: payment.payment_card.card_number_last4,
      } : undefined,
        order_id: orderId,
      created_at: payment.created_at,
      paid_at: payment.paid_at,
      };
    });
  }, [paymentsData]);

  // Analytics from API
  const analytics = useMemo<PaymentAnalyticsData | null>(() => {
    console.log('Processing analytics from paymentsData:', paymentsData);
    if (!paymentsData) return null;
    // Check for analytics in different places
    const analyticsData = paymentsData.analytics || paymentsData.data?.analytics;
    if (!analyticsData) {
      console.log('No analytics data found');
      return null;
    }
    console.log('Analytics data:', analyticsData);
    return analyticsData;
  }, [paymentsData]);

  // Delete card
  const { execute: deleteCard } = useDelete('', {
    immediate: false,
    onSuccess: () => {
      loadCardsStable();
    },
  });

  const handleDeletePaymentMethod = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      await deleteCard({
        url: API_ENDPOINTS.core.customer.paymentCard(id),
      });
    }
  };

  const handleCardAdded = (cardId: number) => {
    // Card already created through modal, just refresh the list
    loadCardsStable();
    setAddModalOpen(false);
  };

  const handleCardClick = (card: PaymentMethod) => {
    setSelectedCard(card);
    setEditModalOpen(true);
  };

  const handleCardUpdated = () => {
    loadCardsStable();
    setEditModalOpen(false);
    setSelectedCard(null);
  };

  const defaultMethod = useMemo(() => paymentMethods.find((m) => m.is_default), [paymentMethods]);

  return (
    <>
      <Helmet>
        <title> Payment | Air Purifier</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack>
              <Typography variant="h4">Payments</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage payment methods and view transaction history
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              {currentTab === 1 && (
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="solar:refresh-bold" />}
                  onClick={loadPaymentsStable}
                  disabled={paymentsLoading}
                >
                  Refresh
                </Button>
              )}
            {currentTab === 0 && (
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                onClick={() => setAddModalOpen(true)}
              >
                Add Method
              </Button>
            )}
            </Stack>
          </Stack>

          {/* Tabs */}
          <Tabs 
            value={currentTab} 
            onChange={(_, newValue) => {
              setCurrentTab(newValue);
              // Automatically update payment data when switching to transactions tab
              if (newValue === 1) {
                loadPaymentsStable();
              }
            }}
          >
            <Tab label="Payment Methods" icon={<Iconify icon="solar:card-bold" />} iconPosition="start" />
            <Tab label="Transaction History" icon={<Iconify icon="solar:document-text-bold" />} iconPosition="start" />
          </Tabs>

          {/* Tab Content */}
          {currentTab === 0 && (
            <Stack spacing={3}>
              {/* Analytics */}
              {analytics && <PaymentAnalytics analytics={analytics} transactions={transactions} />}

              {/* Default Method Info */}
              {defaultMethod && (
                <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
                  Default payment method: <strong>{getPaymentMethodLabel(defaultMethod.type)}</strong>
                  {defaultMethod.last4 && (
                    <> •••• {defaultMethod.last4}</>
                  )}
                </Alert>
              )}

              {/* Payment Methods Grid */}
              {paymentMethods.length === 0 ? (
                <Box
                  sx={{
                    mt: 5,
                    p: 5,
                    width: 1,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                    border: (theme) => `dashed 1px ${theme.palette.divider}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Iconify icon="solar:wallet-money-bold" width={64} sx={{ mb: 2, color: 'text.secondary' }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No payment methods
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Add a payment method for fast and convenient payments
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="solar:add-circle-bold" />}
                    onClick={() => setAddModalOpen(true)}
                  >
                    Add Payment Method
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {paymentMethods.map((method) => (
                    <Grid item xs={12} sm={6} md={4} key={method.id}>
                      <PaymentMethodCard
                        paymentMethod={method}
                        onDelete={handleDeletePaymentMethod}
                        onClick={handleCardClick}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Stack>
          )}

          {currentTab === 1 && (
            <Stack spacing={3}>
              {/* Show error if exists */}
              {paymentsError && (
                <Alert severity="error">
                  Error loading payments: {paymentsError?.message || JSON.stringify(paymentsError)}
                </Alert>
              )}
              {/* Show loading state */}
              {paymentsLoading && (
                <Alert severity="info">Loading data...</Alert>
              )}
              {/* Debug information */}
              {process.env.NODE_ENV === 'development' && paymentsData && (
                <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
                  Debug: paymentsData keys: {Object.keys(paymentsData).join(', ')}
                  {paymentsData.results && `, results count: ${paymentsData.results.length}`}
                  {paymentsData.analytics && ', analytics present'}
                </Alert>
              )}
              <TransactionHistory transactions={transactions} />
              {/* Charts Section */}
              <PaymentCharts transactions={transactions} analytics={analytics} />
            </Stack>
          )}
        </Stack>
      </Container>

      <PaymentCardModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSelect={handleCardAdded}
      />

      <EditPaymentCardModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedCard(null);
        }}
        paymentMethod={selectedCard}
        onSuccess={handleCardUpdated}
      />
    </>
  );
}
