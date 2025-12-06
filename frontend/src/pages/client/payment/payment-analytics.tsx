import { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
// components
import Iconify from 'src/components/iconify';
// types
import { PaymentAnalyticsData } from './types';

// ----------------------------------------------------------------------

interface PaymentAnalyticsProps {
  analytics: PaymentAnalyticsData | null;
  transactions: any[];
}

interface ChartDataPoint {
  date: string;
  amount: number;
}

export function PaymentAnalytics({ analytics, transactions }: PaymentAnalyticsProps) {
  // Группируем транзакции по месяцам для графика
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!transactions || transactions.length === 0) return [];

    const grouped = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      
      const amount = transaction.amount || transaction.amount_usd || 0;
      if (transaction.status === 'PAID' || transaction.status === 'COMPLETED') {
        acc[monthKey] += Number(amount);
      }
      
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount: Number(amount) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  if (!analytics) {
    return null;
  }

  return (
    <Stack spacing={3}>
      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:dollar-bold" width={24} sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Всего потрачено
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  ${analytics.total_paid.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {analytics.total_payments} транзакций
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:calendar-bold" width={24} sx={{ color: 'info.main' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    За 30 дней
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                  ${analytics.recent_30_days.total.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {analytics.recent_30_days.count} платежей
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:calendar-mark-bold" width={24} sx={{ color: 'success.main' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    За 7 дней
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  ${analytics.recent_7_days.total.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {analytics.recent_7_days.count} платежей
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:graph-up-bold" width={24} sx={{ color: 'warning.main' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Средний чек
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  ${analytics.total_payments > 0 ? (analytics.total_paid / analytics.total_payments).toFixed(2) : '0.00'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  за транзакцию
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Расходы по месяцам
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Stack spacing={2}>
                {chartData.map((point, index) => {
                  const maxAmount = Math.max(...chartData.map((p) => p.amount));
                  const percent = maxAmount > 0 ? (point.amount / maxAmount) * 100 : 0;

                  return (
                    <Box key={index}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 120 }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(point.date).toLocaleDateString('ru-RU', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Потрачено
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              ${point.amount.toFixed(2)}
                            </Typography>
                          </Stack>
                          <Box
                            sx={{
                              height: 8,
                              bgcolor: 'primary.lighter',
                              borderRadius: 1,
                              width: `${percent}%`,
                            }}
                          />
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

