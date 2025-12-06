import { Helmet } from 'react-helmet-async';
import { useMemo } from 'react';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
// components
import { useSettingsContext } from 'src/components/settings';
// hooks
import { useGet } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';
// types
import { Investment, InvestorDashboard, InvestmentAnalytics, PaginatedResponse } from '../investments/types';
// components
import { AnalyticsSummary } from './analytics-summary';
import { AnalyticsChart } from './analytics-chart';
import { InvestmentAnalyticsCard } from './investment-analytics-card';

// ----------------------------------------------------------------------

export default function InvestorAnalyticsPage() {
  const settings = useSettingsContext();

  // Загружаем дашборд
  const { data: dashboard } = useGet<InvestorDashboard>(API_ENDPOINTS.core.investor.dashboard);

  // Загружаем инвестиции
  const { data: investments } = useGet<Investment[], any>(API_ENDPOINTS.core.investor.investments, {
    transformResponse: (response) => {
      const { data } = response;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && typeof data === 'object' && 'results' in data) {
        return (data as PaginatedResponse<Investment>).results || [];
      }
      return [];
    },
  });

  // Вычисляем аналитику
  const analytics = useMemo<InvestmentAnalytics | null>(() => {
    if (!investments || investments.length === 0) {
      return null;
    }

    const paidInvestments = investments.filter((inv) => inv.status === 'PAID');

    if (paidInvestments.length === 0) {
      return null;
    }

    const totalInvested = paidInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount_usd), 0);
    const totalProjectedReturn = paidInvestments.reduce(
      (sum, inv) => sum + (inv.projected_return_usd ? parseFloat(inv.projected_return_usd) : 0),
      0
    );
    const totalProfit = totalProjectedReturn - totalInvested;
    const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    // Создаем данные для графика
    const chartData: InvestmentAnalytics['chart_data'] = paidInvestments.map((inv) => {
      const invested = parseFloat(inv.amount_usd);
      const projected = inv.projected_return_usd ? parseFloat(inv.projected_return_usd) : invested;
      const profit = projected - invested;

      return {
        date: inv.projected_return_date || inv.created_at,
        invested,
        projected,
        profit,
      };
    });

    // Данные по каждой инвестиции
    const investmentItems: InvestmentAnalytics['investments'] = paidInvestments.map((inv) => {
      const amount = parseFloat(inv.amount_usd);
      const projectedReturn = inv.projected_return_usd ? parseFloat(inv.projected_return_usd) : amount;
      const profit = projectedReturn - amount;
      const itemProfitPercentage = amount > 0 ? (profit / amount) * 100 : 0;

      // Вычисляем период в месяцах (примерно, на основе projected_return_date)
      let periodMonths = 6; // По умолчанию 6 месяцев
      if (inv.projected_return_date && inv.created_at) {
        const createdDate = new Date(inv.created_at);
        const returnDate = new Date(inv.projected_return_date);
        const diffTime = returnDate.getTime() - createdDate.getTime();
        periodMonths = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30));
      }

      return {
        investment_id: inv.id,
        amount_usd: amount,
        projected_return_usd: projectedReturn,
        profit_usd: profit,
        profit_percentage: itemProfitPercentage,
        period_months: periodMonths,
        projected_date: inv.projected_return_date || inv.created_at,
      };
    });

    return {
      total_invested: totalInvested,
      total_projected_return: totalProjectedReturn,
      total_profit: totalProfit,
      profit_percentage: profitPercentage,
      investments: investmentItems,
      chart_data: chartData,
    };
  }, [investments]);

  return (
    <>
      <Helmet>
        <title> Аналитика | Air Purifier</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack spacing={3}>
          <Typography variant="h4">Аналитика инвестиций</Typography>

          {!analytics ? (
            <Card>
              <CardContent>
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 5 }}>
                  Нет данных для отображения. Создайте инвестиции, чтобы увидеть аналитику.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Cards */}
              <AnalyticsSummary analytics={analytics} dashboard={dashboard} />

              {/* Chart */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Общая динамика инвестиций
                  </Typography>
                  <AnalyticsChart data={analytics.chart_data} />
                </CardContent>
              </Card>

              {/* Individual Investments */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Аналитика по инвестициям
                </Typography>
                <Grid container spacing={3}>
                  {analytics.investments.map((item) => {
                    const investment = investments?.find((inv) => inv.id === item.investment_id);
                    if (!investment) return null;
                    return (
                      <Grid item xs={12} md={6} key={item.investment_id}>
                        <InvestmentAnalyticsCard investment={investment} analytics={item} />
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </>
          )}
        </Stack>
      </Container>
    </>
  );
}

