import { useState, useMemo } from 'react';
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
// components
import { PaymentMethodCard } from './payment-method-card';
import { AddPaymentMethodModal } from './add-payment-method-modal';
import { TransactionHistory } from './transaction-history';
// types
import { PaymentMethod, Transaction } from './types';

// ----------------------------------------------------------------------

// Моковые данные
const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 1,
    type: 'UZCARD',
    last4: '4242',
    cardholder_name: 'IVAN IVANOV',
    expiry_month: 12,
    expiry_year: 2025,
    is_default: true,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    type: 'VISA',
    last4: '8888',
    cardholder_name: 'MARIA PETROVA',
    expiry_month: 6,
    expiry_year: 2026,
    is_default: false,
    created_at: '2024-02-20T14:30:00Z',
  },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    type: 'PAYMENT',
    status: 'COMPLETED',
    amount_usd: 299.99,
    description: 'Оплата заказа #1234',
    payment_method: {
      type: 'UZCARD',
      last4: '4242',
    },
    order_id: 1234,
    created_at: '2024-03-15T10:30:00Z',
  },
  {
    id: 2,
    type: 'PAYMENT',
    status: 'COMPLETED',
    amount_usd: 149.50,
    description: 'Оплата заказа #1235',
    payment_method: {
      type: 'VISA',
      last4: '8888',
    },
    order_id: 1235,
    created_at: '2024-03-12T14:20:00Z',
  },
  {
    id: 3,
    type: 'SUBSCRIPTION',
    status: 'COMPLETED',
    amount_usd: 29.99,
    description: 'Ежемесячная подписка',
    payment_method: {
      type: 'UZCARD',
      last4: '4242',
    },
    created_at: '2024-03-01T09:00:00Z',
  },
  {
    id: 4,
    type: 'REFUND',
    status: 'COMPLETED',
    amount_usd: 99.99,
    description: 'Возврат по заказу #1200',
    payment_method: {
      type: 'UZCARD',
      last4: '4242',
    },
    order_id: 1200,
    created_at: '2024-02-28T16:45:00Z',
  },
  {
    id: 5,
    type: 'PAYMENT',
    status: 'PENDING',
    amount_usd: 199.99,
    description: 'Оплата заказа #1236',
    payment_method: {
      type: 'VISA',
      last4: '8888',
    },
    order_id: 1236,
    created_at: '2024-03-20T11:15:00Z',
  },
  {
    id: 6,
    type: 'PAYMENT',
    status: 'FAILED',
    amount_usd: 79.99,
    description: 'Оплата заказа #1237',
    payment_method: {
      type: 'UZCARD',
      last4: '4242',
    },
    order_id: 1237,
    created_at: '2024-02-25T13:30:00Z',
  },
];

export default function ClientPaymentPage() {
  const settings = useSettingsContext();
  const [currentTab, setCurrentTab] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleAddPaymentMethod = (newMethod: Omit<PaymentMethod, 'id' | 'created_at'>) => {
    const paymentMethod: PaymentMethod = {
      ...newMethod,
      id: paymentMethods.length > 0 ? Math.max(...paymentMethods.map((m) => m.id)) + 1 : 1,
      created_at: new Date().toISOString(),
    };

    // Если устанавливается как default, снимаем default с остальных
    if (paymentMethod.is_default) {
      setPaymentMethods(
        paymentMethods.map((m) => ({ ...m, is_default: false })).concat(paymentMethod)
      );
    } else {
      setPaymentMethods([...paymentMethods, paymentMethod]);
    }
  };

  const handleDeletePaymentMethod = (id: number) => {
    setPaymentMethods(paymentMethods.filter((m) => m.id !== id));
  };

  const handleSetDefault = (id: number) => {
    setPaymentMethods(
      paymentMethods.map((m) => ({
        ...m,
        is_default: m.id === id,
      }))
    );
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
              <Typography variant="h4">Платежи</Typography>
              <Typography variant="body2" color="text.secondary">
                Управляйте методами оплаты и просматривайте историю транзакций
              </Typography>
            </Stack>
            {currentTab === 0 && (
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                onClick={() => setAddModalOpen(true)}
              >
                Добавить метод
              </Button>
            )}
          </Stack>

          {/* Tabs */}
          <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
            <Tab label="Методы оплаты" icon={<Iconify icon="solar:card-bold" />} iconPosition="start" />
            <Tab label="История транзакций" icon={<Iconify icon="solar:document-text-bold" />} iconPosition="start" />
          </Tabs>

          {/* Tab Content */}
          {currentTab === 0 && (
            <Stack spacing={3}>
              {/* Default Method Info */}
              {defaultMethod && (
                <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
                  Метод оплаты по умолчанию: <strong>{defaultMethod.type}</strong>
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
                    Нет методов оплаты
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Добавьте метод оплаты для быстрых и удобных платежей
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="solar:add-circle-bold" />}
                    onClick={() => setAddModalOpen(true)}
                  >
                    Добавить метод оплаты
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {paymentMethods.map((method) => (
                    <Grid item xs={12} sm={6} md={4} key={method.id}>
                      <PaymentMethodCard
                        paymentMethod={method}
                        onDelete={handleDeletePaymentMethod}
                        onSetDefault={handleSetDefault}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Stack>
          )}

          {currentTab === 1 && (
            <TransactionHistory transactions={transactions} />
          )}
        </Stack>
      </Container>

      <AddPaymentMethodModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddPaymentMethod}
      />
    </>
  );
}
