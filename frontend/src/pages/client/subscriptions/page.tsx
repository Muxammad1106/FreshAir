import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
// components
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
// components
import { SubscriptionCard } from './subscription-card';
// types
import { Subscription } from './types';

// ----------------------------------------------------------------------

// Моковые данные
const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 1,
    order_id: 1234,
    order_number: '#1234',
    status: 'ACTIVE',
    monthly_amount_usd: 99.99,
    start_date: '2024-01-15T10:00:00Z',
    next_payment_date: '2024-04-15T10:00:00Z',
    order: {
      id: 1234,
      status: 'ACTIVE',
      rooms: [
        {
          room: {
            name: 'Гостиная',
            room_type: 'HOME',
          },
          device_types: [
            { name: 'Air Purifier Pro' },
            { name: 'Humidifier Plus' },
          ],
        },
        {
          room: {
            name: 'Спальня',
            room_type: 'HOME',
          },
          device_types: [
            { name: 'Air Purifier Pro' },
          ],
        },
      ],
    },
  },
  {
    id: 2,
    order_id: 1235,
    order_number: '#1235',
    status: 'ACTIVE',
    monthly_amount_usd: 149.50,
    start_date: '2024-02-01T09:00:00Z',
    next_payment_date: '2024-05-01T09:00:00Z',
    order: {
      id: 1235,
      status: 'ACTIVE',
      rooms: [
        {
          room: {
            name: 'Офис',
            room_type: 'COMMERCIAL',
          },
          device_types: [
            { name: 'Air Purifier Commercial' },
            { name: 'Humidifier Plus' },
            { name: 'Aroma Diffuser' },
          ],
        },
      ],
    },
  },
  {
    id: 3,
    order_id: 1230,
    order_number: '#1230',
    status: 'ACTIVE',
    monthly_amount_usd: 79.99,
    start_date: '2024-03-01T10:00:00Z',
    next_payment_date: '2024-06-01T10:00:00Z',
    order: {
      id: 1230,
      status: 'ACTIVE',
      rooms: [
        {
          room: {
            name: 'Кухня',
            room_type: 'HOME',
          },
          device_types: [
            { name: 'Air Purifier Pro' },
          ],
        },
      ],
    },
  },
  {
    id: 4,
    order_id: 1200,
    order_number: '#1200',
    status: 'CANCELLED',
    monthly_amount_usd: 59.99,
    start_date: '2023-12-01T10:00:00Z',
    next_payment_date: '2024-03-01T10:00:00Z',
    cancelled_at: '2024-02-15T14:30:00Z',
    order: {
      id: 1200,
      status: 'CANCELLED',
      rooms: [
        {
          room: {
            name: 'Кабинет',
            room_type: 'HOME',
          },
          device_types: [
            { name: 'Air Purifier Pro' },
          ],
        },
      ],
    },
  },
];

export default function ClientSubscriptionsPage() {
  const settings = useSettingsContext();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS);

  // Статистика
  const activeSubscriptions = useMemo(
    () => subscriptions.filter((sub) => sub.status === 'ACTIVE'),
    [subscriptions]
  );

  const totalMonthlyAmount = useMemo(
    () => activeSubscriptions.reduce((sum, sub) => sum + sub.monthly_amount_usd, 0),
    [activeSubscriptions]
  );

  const handleCancelSubscription = (id: number) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              status: 'CANCELLED' as const,
              cancelled_at: new Date().toISOString(),
            }
          : sub
      )
    );
  };

  return (
    <>
      <Helmet>
        <title> Подписки | Air Purifier</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack>
            <Typography variant="h4">Мои подписки</Typography>
            <Typography variant="body2" color="text.secondary">
              Управляйте вашими активными подписками
            </Typography>
          </Stack>

          {/* Statistics Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="solar:card-bold" width={24} sx={{ color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Активных подписок
                      </Typography>
                    </Stack>
                    <Typography variant="h4">{activeSubscriptions.length}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="solar:wallet-money-bold" width={24} sx={{ color: 'success.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Платеж в месяц
                      </Typography>
                    </Stack>
                    <Typography variant="h4" color="success.main">
                      ${totalMonthlyAmount.toFixed(2)}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="solar:document-text-bold" width={24} sx={{ color: 'warning.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Всего подписок
                      </Typography>
                    </Stack>
                    <Typography variant="h4">{subscriptions.length}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Subscriptions List */}
          {subscriptions.length === 0 ? (
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
              <Iconify icon="solar:card-send-bold" width={64} sx={{ mb: 2, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Нет подписок
              </Typography>
              <Typography variant="body2" color="text.secondary">
                У вас пока нет активных подписок
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {subscriptions.map((subscription) => (
                <Grid item xs={12} md={6} key={subscription.id}>
                  <SubscriptionCard
                    subscription={subscription}
                    onCancel={handleCancelSubscription}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Container>
    </>
  );
}

