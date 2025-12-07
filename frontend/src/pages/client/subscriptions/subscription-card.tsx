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
  ACTIVE: 'Active',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  SUSPENDED: 'Waiting for Order Activation',
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
                <Typography variant="h6">Subscription #{subscription.id}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Order #{subscription.order.id}
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
                      Rooms: <strong>{roomsCount}</strong>
                    </Typography>
                    {devicesCount > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Devices: <strong>{devicesCount}</strong>
                      </Typography>
                    )}
                  </Stack>
                  {subscription.order.rooms.map((orderRoom, idx) => (
                    <Typography key={idx} variant="caption" color="text.secondary" component="div">
                      <strong>{orderRoom.room.name}</strong>: {orderRoom.device_types?.map((dt) => dt.name).join(', ') || 'No devices'}
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
                  Monthly Amount:
                </Typography>
                <Typography variant="h6" color="primary.main">
                  ${parseFloat(String(subscription.monthly_amount_usd)).toFixed(2)}
                </Typography>
              </Stack>
              {subscription.status === 'SUSPENDED' && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  <Typography variant="caption">
                    Subscription will be activated after order installation via admin panel
                  </Typography>
                </Alert>
              )}
              {subscription.status === 'ACTIVE' && (
                <>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Start Date:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {fDate(subscription.start_date)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Next Payment:
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
                    Cancelled Date:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {fDate(subscription.cancelled_at)}
                  </Typography>
                </Stack>
              )}
              {subscription.status === 'SUSPENDED' && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Order Status:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {subscription.order.status === 'APPROVED' && 'Approved'}
                    {subscription.order.status === 'INSTALLED' && 'Installed'}
                    {subscription.order.status === 'PENDING' && 'Pending Payment'}
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
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
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
            <Typography variant="h6">Cancel Subscription</Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel subscription #{subscription.id}?
            <br />
            <br />
            The subscription will remain active until {fDate(subscription.next_payment_date)}, after which it will be automatically cancelled.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirmCancel} variant="contained" color="error">
            Cancel Subscription
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

