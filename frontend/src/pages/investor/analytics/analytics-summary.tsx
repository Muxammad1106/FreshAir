import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
// components
import Iconify from 'src/components/iconify';
// types
import { InvestmentAnalytics, InvestorDashboard } from '../investments/types';

// ----------------------------------------------------------------------

interface AnalyticsSummaryProps {
  analytics: InvestmentAnalytics;
  dashboard: InvestorDashboard | null;
}

export function AnalyticsSummary({ analytics, dashboard }: AnalyticsSummaryProps) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:dollar-bold" width={24} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Всего вложено
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ${analytics.total_invested.toFixed(2)}
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
                <Iconify icon="solar:graph-up-bold" width={24} sx={{ color: 'success.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Прогнозируемый доход
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                ${analytics.total_projected_return.toFixed(2)}
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
                <Iconify icon="solar:wallet-money-bold" width={24} sx={{ color: 'info.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Прибыль
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                ${analytics.total_profit.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {analytics.profit_percentage.toFixed(1)}% доходность
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
                <Iconify icon="solar:devices-bold" width={24} sx={{ color: 'warning.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Активных устройств
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {dashboard?.active_devices_count || 0}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

