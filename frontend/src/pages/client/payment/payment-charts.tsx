import { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
// components
import Iconify from 'src/components/iconify';
// types
import { Transaction, PaymentAnalyticsData } from './types';

// ----------------------------------------------------------------------

interface PaymentChartsProps {
  transactions: Transaction[];
  analytics: PaymentAnalyticsData | null;
}

interface ChartDataPoint {
  date: string;
  amount: number;
  count: number;
}

export function PaymentCharts({ transactions, analytics }: PaymentChartsProps) {
  // Данные для графика расходов по месяцам
  const monthlyData = useMemo<ChartDataPoint[]>(() => {
    if (!transactions || transactions.length === 0) return [];

    const grouped = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { date: monthKey, amount: 0, count: 0 };
      }
      
      const amount = transaction.amount || transaction.amount_usd || 0;
      if (transaction.status === 'PAID' || transaction.status === 'COMPLETED') {
        acc[monthKey].amount += Number(amount);
        acc[monthKey].count += 1;
      }
      
      return acc;
    }, {} as Record<string, ChartDataPoint>);

    return Object.values(grouped)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-6); // Последние 6 месяцев
  }, [transactions]);

  // Данные для графика по дням недели
  const weeklyData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const grouped = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.created_at);
      const dayOfWeek = date.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Понедельник = 0
      
      if (!acc[dayIndex]) {
        acc[dayIndex] = { day: daysOfWeek[dayIndex], amount: 0, count: 0 };
      }
      
      const amount = transaction.amount || transaction.amount_usd || 0;
      if (transaction.status === 'PAID' || transaction.status === 'COMPLETED') {
        acc[dayIndex].amount += Number(amount);
        acc[dayIndex].count += 1;
      }
      
      return acc;
    }, {} as Record<number, { day: string; amount: number; count: number }>);

    return daysOfWeek.map((day, index) => ({
      day,
      amount: grouped[index]?.amount || 0,
      count: grouped[index]?.count || 0,
    }));
  }, [transactions]);

  // Статистика по статусам
  const statusStats = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const stats = transactions.reduce((acc, transaction) => {
      const { status } = transaction;
      if (!acc[status]) {
        acc[status] = { count: 0, amount: 0 };
      }
      acc[status].count += 1;
      const amount = transaction.amount || transaction.amount_usd || 0;
      if (status === 'PAID' || status === 'COMPLETED') {
        acc[status].amount += Number(amount);
      }
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    return Object.entries(stats).map(([status, data]) => ({
      status,
      ...data,
    }));
  }, [transactions]);

  const maxMonthlyAmount = monthlyData.length > 0 ? Math.max(...monthlyData.map((d) => d.amount)) : 0;
  const maxWeeklyAmount = weeklyData.length > 0 ? Math.max(...weeklyData.map((d) => d.amount)) : 0;

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'primary' => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Оплачено';
      case 'COMPLETED':
        return 'Завершено';
      case 'PENDING':
        return 'В обработке';
      case 'FAILED':
        return 'Ошибка';
      default:
        return status;
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Аналитика и графики</Typography>

      <Grid container spacing={3}>
        {/* График расходов по месяцам */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:chart-bold" width={24} sx={{ color: 'primary.main' }} />
                  <Typography variant="h6">Расходы по месяцам</Typography>
                </Stack>
                {monthlyData.length === 0 ? (
                  <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Нет данных для отображения
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {monthlyData.map((point, index) => {
                      const percent = maxMonthlyAmount > 0 ? (point.amount / maxMonthlyAmount) * 100 : 0;
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
                                  {point.count} транзакций
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  ${point.amount.toFixed(2)}
                                </Typography>
                              </Stack>
                              <Box
                                sx={{
                                  height: 12,
                                  bgcolor: 'primary.lighter',
                                  borderRadius: 1,
                                  width: `${percent}%`,
                                  position: 'relative',
                                  overflow: 'hidden',
                                }}
                              >
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: '100%',
                                    width: '100%',
                                    bgcolor: 'primary.main',
                                    borderRadius: 1,
                                  }}
                                />
                              </Box>
                            </Box>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* График по дням недели */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:calendar-bold" width={24} sx={{ color: 'info.main' }} />
                  <Typography variant="h6">По дням недели</Typography>
                </Stack>
                {weeklyData.length === 0 ? (
                  <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Нет данных
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {weeklyData.map((point, index) => {
                      const percent = maxWeeklyAmount > 0 ? (point.amount / maxWeeklyAmount) * 100 : 0;
                      return (
                        <Box key={index}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {point.day}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              ${point.amount.toFixed(2)}
                            </Typography>
                          </Stack>
                          <Box
                            sx={{
                              height: 8,
                              bgcolor: 'info.lighter',
                              borderRadius: 1,
                              width: '100%',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100%',
                                width: `${percent}%`,
                                bgcolor: 'info.main',
                                borderRadius: 1,
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Статистика по статусам */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:pie-chart-bold" width={24} sx={{ color: 'warning.main' }} />
                  <Typography variant="h6">Статистика по статусам</Typography>
                </Stack>
                {statusStats.length === 0 ? (
                  <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Нет данных
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {statusStats.map((stat, index) => {
                      const colorType = getStatusColor(stat.status);
                      return (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              bgcolor: (theme) => alpha(theme.palette[colorType].main, 0.08),
                              border: (theme) => `1px solid ${alpha(theme.palette[colorType].main, 0.2)}`,
                            }}
                          >
                            <Stack spacing={1}>
                              <Typography variant="caption" color="text.secondary">
                                {getStatusLabel(stat.status)}
                              </Typography>
                              <Typography variant="h6" sx={{ color: `${colorType}.main` }}>
                                {stat.count}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ${stat.amount.toFixed(2)}
                              </Typography>
                            </Stack>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

