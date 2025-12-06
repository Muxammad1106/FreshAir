import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
// components
import Iconify from 'src/components/iconify';
// utils
import { fDate } from 'src/utils/format-time';
// types
import { Investment, InvestmentAnalyticsItem } from '../investments/types';

// ----------------------------------------------------------------------

interface InvestmentAnalyticsCardProps {
  investment: Investment;
  analytics: InvestmentAnalyticsItem;
}

export function InvestmentAnalyticsCard({ investment, analytics }: InvestmentAnalyticsCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6">Инвестиция #{investment.id}</Typography>
              <Typography variant="caption" color="text.secondary">
                {investment.device?.device_type.name}
              </Typography>
            </Box>
            <Chip label={`${analytics.period_months} мес.`} size="small" color="primary" />
          </Stack>

          <Box>
            <Typography variant="caption" color="text.disabled">
              Вложено
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              ${analytics.amount_usd.toFixed(2)}
            </Typography>
          </Box>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.disabled">
                Прогнозируемый доход
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                ${analytics.projected_return_usd.toFixed(2)}
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Прибыль: <strong>${analytics.profit_usd.toFixed(2)}</strong> ({analytics.profit_percentage.toFixed(1)}%)
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, analytics.profit_percentage)}
                color="success"
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Stack>
          </Box>

          <Stack direction="row" spacing={2} divider={<Box sx={{ borderLeft: 1, borderColor: 'divider', height: 20, alignSelf: 'center' }} />}>
            <Box>
              <Typography variant="caption" color="text.disabled">
                Очищено воздуха
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {investment.cleaned_air_m3.toFixed(0)} м³
              </Typography>
            </Box>
            {investment.humidified_hours > 0 && (
              <Box>
                <Typography variant="caption" color="text.disabled">
                  Часов увлажнения
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {investment.humidified_hours}
                </Typography>
              </Box>
            )}
          </Stack>

          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="solar:calendar-bold" width={16} sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Прогнозируемая дата возврата: {fDate(analytics.projected_date)}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

