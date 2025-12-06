import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
// hooks
import { usePost } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';
import { fDate } from 'src/utils/format-time';
// types
import { Investment } from './types';

// ----------------------------------------------------------------------

interface InvestmentModalProps {
  open: boolean;
  investment: Investment;
  onClose: () => void;
}

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

export function InvestmentModal({ open, investment, onClose }: InvestmentModalProps) {
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { loading: paying, execute: confirmPayment } = usePost(
    '',
    {
      immediate: false,
      onSuccess: (data: any) => {
        console.log('Payment success:', data);
        setPaymentError(null);
        onClose();
        // Небольшая задержка перед перезагрузкой
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      onError: (error: any) => {
        console.error('Payment error:', error);
        const errorMessage = error?.message || error?.detail || error?.error || 'Ошибка при оплате инвестиции';
        setPaymentError(errorMessage);
      },
    }
  );

  const handlePay = async () => {
    setPaymentError(null);
    try {
      await confirmPayment({
        url: API_ENDPOINTS.core.investor.confirmPayment(investment.id),
        data: {},
      });
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const amount = parseFloat(investment.amount_usd);
  const projectedReturn = investment.projected_return_usd ? parseFloat(investment.projected_return_usd) : null;
  const profit = projectedReturn ? projectedReturn - amount : null;
  const profitPercentage = profit ? ((profit / amount) * 100).toFixed(1) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Инвестиция #{investment.id}</Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="solar:close-bold" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Scrollbar>
          <Stack spacing={3}>
            {/* Status */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">Статус</Typography>
                <Chip
                  label={STATUS_LABELS[investment.status] || investment.status}
                  color={STATUS_COLORS[investment.status] || 'default'}
                  size="small"
                />
              </Stack>
            </Box>

            <Divider />

            {/* Device Info */}
            {investment.device && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Информация об устройстве
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:device-phone-bold" width={20} sx={{ color: 'text.secondary' }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {investment.device.device_type.name}
                        </Typography>
                        <Chip label={investment.device.device_type.device_category} size="small" />
                      </Stack>
                      {investment.device.room && (
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Iconify icon="solar:home-2-bold" width={18} sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {investment.device.room.city}, {investment.device.room.name}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.disabled">
                            Площадь: {investment.device.room.area_m2} м²
                          </Typography>
                        </Stack>
                      )}
                      <Stack direction="row" spacing={2}>
                        <Box>
                          <Typography variant="caption" color="text.disabled">
                            Статус устройства
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {investment.device.status}
                          </Typography>
                        </Box>
                        {investment.device.serial_number && (
                          <Box>
                            <Typography variant="caption" color="text.disabled">
                              Серийный номер
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {investment.device.serial_number}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            )}

            <Divider />

            {/* Investment Details */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Детали инвестиции
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="caption" color="text.disabled">
                          Сумма инвестиции
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          ${amount.toFixed(2)}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                {projectedReturn && (
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.disabled">
                            Прогнозируемый доход
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                            ${projectedReturn.toFixed(2)}
                          </Typography>
                          {profit && profitPercentage && (
                            <Typography variant="caption" color="text.secondary">
                              Прибыль: ${profit.toFixed(2)} ({profitPercentage}%)
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Projected Return Details */}
            {projectedReturn && investment.projected_return_date && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Прогноз доходности
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      {profit && profitPercentage && (
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.disabled">
                              Прибыль
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ${profit.toFixed(2)} ({profitPercentage}%)
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, parseFloat(profitPercentage))}
                            color="success"
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                        </Box>
                      )}
                      <Stack direction="row" spacing={2}>
                        <Box>
                          <Typography variant="caption" color="text.disabled">
                            Дата возврата
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {fDate(investment.projected_return_date)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.disabled">
                            Дата создания
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {fDate(investment.created_at)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Stats */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Статистика устройства
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.disabled">
                          Очищено воздуха
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {investment.cleaned_air_m3.toFixed(0)} м³
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                {investment.humidified_hours > 0 && (
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.disabled">
                            Часов увлажнения
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {investment.humidified_hours}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Payment Error */}
            {paymentError && (
              <Alert severity="error">{paymentError}</Alert>
            )}

            {/* Payment Button */}
            {investment.status === 'PENDING' && (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Для активации инвестиции необходимо подтвердить оплату
                </Alert>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handlePay}
                  disabled={paying}
                  startIcon={<Iconify icon="solar:wallet-money-bold" />}
                >
                  {paying ? 'Обработка оплаты...' : 'Подтвердить оплату'}
                </Button>
              </Box>
            )}

            {investment.status === 'PAID' && investment.paid_at && (
              <Alert severity="success">
                Инвестиция оплачена {fDate(investment.paid_at)}
              </Alert>
            )}
          </Stack>
        </Scrollbar>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}

