import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { alpha } from '@mui/material/styles';
// components
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
// hooks
import { useGet } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';
// components
import { SubscriptionCard } from './subscription-card';
// types
import { Subscription } from './types';

// ----------------------------------------------------------------------

export default function ClientSubscriptionsPage() {
  const settings = useSettingsContext();

  // Загружаем подписки
  const { data: subscriptions = [], loading, error, execute } = useGet<Subscription[], any>(
    API_ENDPOINTS.core.customer.subscriptions,
    {
      transformResponse: (response) => {
        const { data } = response;
        // Если это массив - возвращаем как есть
        if (Array.isArray(data)) {
          return data;
        }
        // Если это объект с results (пагинация DRF)
        if (data && typeof data === 'object' && 'results' in data) {
          return data.results || [];
        }
        // Fallback
        return [];
      },
    }
  );

  // Статистика - считаем только активные подписки (не SUSPENDED)
  const activeSubscriptions = useMemo(
    () => (subscriptions || []).filter((sub) => sub.status === 'ACTIVE'),
    [subscriptions]
  );

  const totalMonthlyAmount = useMemo(
    () => activeSubscriptions.reduce((sum, sub) => sum + parseFloat(String(sub.monthly_amount_usd)), 0),
    [activeSubscriptions]
  );

  // Отмена подписки
  const handleCancelSubscription = async (id: number) => {
    try {
      const axiosInstance = (await import('src/utils/axios')).default;
      
      await axiosInstance.post(
        API_ENDPOINTS.core.customer.subscriptionCancel(id),
        {}
      );
      
      // Обновляем список после успешной отмены
      execute();
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      throw err; // Пробрасываем ошибку дальше для обработки в компоненте
    }
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

          {/* Error Alert */}
          {error && (
            <Alert severity="error">
              Ошибка при загрузке подписок. Попробуйте обновить страницу.
            </Alert>
          )}

          {/* Statistics Cards */}
          {!loading && (
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
                      <Typography variant="h4">{(subscriptions || []).length}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Loading State */}
          {loading && (
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
              <Typography variant="h6" color="text.secondary">
                Загрузка...
              </Typography>
            </Box>
          )}

          {/* Subscriptions List */}
          {!loading && (!subscriptions || subscriptions.length === 0) && (
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
          )}

          {!loading && subscriptions && subscriptions.length > 0 && (
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

