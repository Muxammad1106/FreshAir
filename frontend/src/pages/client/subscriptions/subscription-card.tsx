import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
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
  onCancel: (id: number) => void;
}

const STATUS_COLORS: Record<Subscription['status'], 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  ACTIVE: 'success',
  CANCELLED: 'default',
  EXPIRED: 'error',
  SUSPENDED: 'warning',
};

const STATUS_LABELS: Record<Subscription['status'], string> = {
  ACTIVE: 'Активна',
  CANCELLED: 'Отменена',
  EXPIRED: 'Истекла',
  SUSPENDED: 'Приостановлена',
};

export function SubscriptionCard({ subscription, onCancel }: SubscriptionCardProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    onCancel(subscription.id);
    setCancelDialogOpen(false);
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
                  Заказ #{subscription.order_id}
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
                  <Typography variant="caption" color="text.secondary">
                    {subscription.order.rooms.map((orderRoom, idx) => (
                      <Box key={idx} component="span" sx={{ display: 'block' }}>
                        {orderRoom.room.name} ({orderRoom.device_types?.map(dt => dt.name).join(', ')})
                      </Box>
                    ))}
                  </Typography>
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
                  ${subscription.monthly_amount_usd.toFixed(2)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Дата начала:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {fDate(subscription.start_date)}
                </Typography>
              </Stack>
              {subscription.status === 'ACTIVE' && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Следующий платёж:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" color="warning.main">
                    {fDate(subscription.next_payment_date)}
                  </Typography>
                </Stack>
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
            </Stack>

            {/* Cancel Button */}
            {subscription.status === 'ACTIVE' && (
              <>
                <Divider />
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<Iconify icon="solar:close-circle-bold" />}
                  onClick={handleCancelClick}
                >
                  Отменить подписку
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

