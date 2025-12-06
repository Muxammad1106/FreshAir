import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import IconButton from '@mui/material/IconButton';
// components
import Iconify from 'src/components/iconify';
// utils
import { fDate } from 'src/utils/format-time';
// types
import { Subscription } from './types';

// ----------------------------------------------------------------------

interface SubscriptionCardProps {
  subscription: Subscription;
  onCancel: (id: number) => void | Promise<void>;
}

const STATUS_COLORS: Record<Subscription['status'], 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  ACTIVE: 'success',
  CANCELLED: 'default',
  EXPIRED: 'error',
  SUSPENDED: 'info',
};

const STATUS_LABELS: Record<Subscription['status'], string> = {
  ACTIVE: 'Активна',
  CANCELLED: 'Отменена',
  EXPIRED: 'Истекла',
  SUSPENDED: 'Ожидает активации заказа',
};

export function SubscriptionCard({ subscription, onCancel }: SubscriptionCardProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await onCancel(subscription.id);
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setCancelling(false);
    }
  };

  const handleCloseDialog = () => {
    setCancelDialogOpen(false);
  };

  const roomsCount = subscription.order.rooms?.length || 0;
  const devicesCount = subscription.order.rooms?.reduce((acc, room) => acc + (room.device_types?.length || 0), 0) || 0;

  return (
    <>
      <Card
        sx={{
          transition: 'all 0.3s',
          border: (theme) => subscription.status === 'ACTIVE' ? `2px solid ${theme.palette.success.main}` : 'none',
          '&:hover': {
            boxShadow: (theme) => theme.customShadows.z20,
            transform: 'translateY(-4px)',
          },
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack spacing={0.5}>
                <Typography variant="h6">Подписка #{subscription.id}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Заказ #{subscription.order.id}
                </Typography>
              </Stack>
              <Chip
                label={STATUS_LABELS[subscription.status]}
                color={STATUS_COLORS[subscription.status]}
                size="small"
              />
            </Stack>

            <Divider />

            {/* Order Info */}
            <Stack spacing={1}>
              {subscription.order.rooms && subscription.order.rooms.length > 0 && (
                <>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      Комнат: <strong>{roomsCount}</strong>
                    </Typography>
                    {devicesCount > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Устройств: <strong>{devicesCount}</strong>
                      </Typography>
                    )}
                  </Stack>
                  {subscription.order.rooms.map((orderRoom, idx) => (
                    <Typography key={idx} variant="caption" color="text.secondary" component="div">
                      <strong>{orderRoom.room.name}</strong>: {orderRoom.device_types?.map((dt) => dt.name).join(', ') || 'Нет устройств'}
                    </Typography>
                  ))}
                </>
              )}
            </Stack>

            <Divider />

            {/* Subscription Details */}
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Сумма в месяц:
                </Typography>
                <Typography variant="h6" color="primary.main">
                  ${parseFloat(String(subscription.monthly_amount_usd)).toFixed(2)}
                </Typography>
              </Stack>
              {subscription.status === 'SUSPENDED' && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  <Typography variant="caption">
                    Подписка будет активирована после установки заказа через админку
                  </Typography>
                </Alert>
              )}
              {subscription.status === 'ACTIVE' && (
                <>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Дата начала:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {fDate(subscription.start_date)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Следующий платёж:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium" color="warning.main">
                      {fDate(subscription.next_payment_date)}
                    </Typography>
                  </Stack>
                </>
              )}
              {subscription.status === 'CANCELLED' && subscription.cancelled_at && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Дата отмены:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {fDate(subscription.cancelled_at)}
                  </Typography>
                </Stack>
              )}
              {subscription.status === 'SUSPENDED' && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Статус заказа:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {subscription.order.status === 'APPROVED' && 'Одобрен'}
                    {subscription.order.status === 'INSTALLED' && 'Установлен'}
                    {subscription.order.status === 'PENDING' && 'Ожидает оплаты'}
                    {!['APPROVED', 'INSTALLED', 'PENDING'].includes(subscription.order.status) && subscription.order.status}
                  </Typography>
                </Stack>
              )}
            </Stack>

            {/* Cancel Button */}
            {subscription.status === 'ACTIVE' && !cancelling && (
              <>
                <Divider />
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  disabled={cancelling}
                  startIcon={<Iconify icon="solar:close-circle-bold" />}
                  onClick={handleCancelClick}
                >
                  {cancelling ? 'Отмена...' : 'Отменить подписку'}
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Отменить подписку</Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите отменить подписку #{subscription.id}?
            <br />
            <br />
            Подписка будет активна до {fDate(subscription.next_payment_date)}, после чего будет автоматически отменена.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleConfirmCancel} variant="contained" color="error">
            Отменить подписку
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

