import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
// components
import Iconify from 'src/components/iconify';
// utils
import { fDate } from 'src/utils/format-time';
// types
import { Investment } from './types';

// ----------------------------------------------------------------------

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  PENDING: 'warning',
  PAID: 'success',
  FAILED: 'error',
  CANCELLED: 'default',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидает оплаты',
  PAID: 'Оплачено',
  FAILED: 'Ошибка',
  CANCELLED: 'Отменено',
};

interface InvestmentCardProps {
  investment: Investment;
  onClick: () => void;
}

export function InvestmentCard({ investment, onClick }: InvestmentCardProps) {
  const amount = parseFloat(investment.amount_usd);
  const projectedReturn = investment.projected_return_usd ? parseFloat(investment.projected_return_usd) : null;
  const profit = projectedReturn ? projectedReturn - amount : null;
  const profitPercentage = profit ? ((profit / amount) * 100).toFixed(1) : null;

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: (theme) => theme.customShadows.z20,
          transform: 'translateY(-4px)',
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6">Инвестиция #{investment.id}</Typography>
              <Typography variant="caption" color="text.secondary">
                {fDate(investment.created_at)}
              </Typography>
            </Box>
            <Chip
              label={STATUS_LABELS[investment.status] || investment.status}
              color={STATUS_COLORS[investment.status] || 'default'}
              size="small"
            />
          </Stack>

          {/* Device Info */}
          {investment.device && (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Iconify icon="solar:device-phone-bold" width={18} sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {investment.device.device_type.name}
                </Typography>
              </Stack>
              {investment.device.room && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:home-2-bold" width={16} sx={{ color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {investment.device.room.city}, {investment.device.room.name}
                  </Typography>
                </Stack>
              )}
            </Box>
          )}

          {/* Investment Amount */}
          <Box>
            <Typography variant="caption" color="text.disabled">
              Сумма инвестиции
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              ${amount.toFixed(2)}
            </Typography>
          </Box>

          {/* Projected Return */}
          {projectedReturn && investment.projected_return_date && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.disabled">
                  Прогнозируемый доход
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  ${projectedReturn.toFixed(2)}
                </Typography>
              </Stack>
              {profit && profitPercentage && (
                <Stack spacing={0.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Прибыль: <strong>${profit.toFixed(2)}</strong> ({profitPercentage}%)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, parseFloat(profitPercentage))}
                    color="success"
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Stack>
              )}
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                До: {fDate(investment.projected_return_date)}
              </Typography>
            </Box>
          )}

          {/* Stats */}
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
        </Stack>
      </CardContent>
    </Card>
  );
}


