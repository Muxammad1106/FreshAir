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
// types
import { Order, OrderRoom } from './types';
// components
import { RoomModal } from './room-modal';
import { PaymentCardModal } from './payment-card-modal';

// ----------------------------------------------------------------------

interface OrderModalProps {
  open: boolean;
  order: Order;
  onClose: () => void;
}

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Pending Payment', color: 'warning' },
  { key: 'APPROVED', label: 'Approved', color: 'info' },
  { key: 'INSTALLED', label: 'Installed', color: 'primary' },
  { key: 'ACTIVE', label: 'Active', color: 'success' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#ed6c02',
  APPROVED: '#0288d1',
  INSTALLED: '#1976d2',
  ACTIVE: '#2e7d32',
  CANCELLED: '#d32f2f',
};

const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  if (status === 'PENDING') return 'warning';
  if (status === 'ACTIVE') return 'success';
  return 'default';
};

const getRoomTypeLabel = (roomType: string): string => {
  if (roomType === 'HOME') return 'Home';
  if (roomType === 'COMMERCIAL') return 'Commercial';
  return 'Large Enterprise';
};

export function OrderModal({ open, order, onClose }: OrderModalProps) {
  const [selectedRoom, setSelectedRoom] = useState<OrderRoom | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showPaymentCardModal, setShowPaymentCardModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  const { loading: paying, execute: payOrder } = usePost(
    '',
    {
      immediate: false,
      onSuccess: (data: any) => {
        console.log('Payment success:', data);
        setPaymentError(null);
        // API returns {order: ..., devices_created: ..., message: ...}
        // or just order depending on format
        const orderData = data?.order || data;
        if (orderData) {
          console.log('Order updated:', orderData);
          console.log('Devices created:', data?.devices_created);
        }
        onClose();
        // Small delay before reloading so user sees success
        // and devices have time to be created on backend
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      onError: (error: any) => {
        console.error('Payment error:', error);
        const errorMessage = error?.message || error?.detail || error?.error || 'Error processing payment';
        setPaymentError(errorMessage);
      },
    }
  );

  const processPayment = async (cardId: number) => {
    setPaymentError(null);
    try {
      await payOrder({
        url: API_ENDPOINTS.core.customer.orderPay(order.id),
        data: {
          payment_card_id: cardId,
        },
      });
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentError('Failed to process payment. Please try again.');
    }
  };

  const handlePay = async () => {
    setPaymentError(null);
    // If no card selected, open card selection modal
    if (!selectedCardId) {
      setShowPaymentCardModal(true);
      return;
    }

    await processPayment(selectedCardId);
  };

  const handleCardSelected = (cardId: number) => {
    setSelectedCardId(cardId);
    setShowPaymentCardModal(false);
    // Automatically process payment after card selection
    setTimeout(() => {
      processPayment(cardId);
    }, 100);
  };

  const handleOpenRoomModal = (orderRoom: OrderRoom) => {
    setSelectedRoom(orderRoom);
  };

  const handleCloseRoomModal = () => {
    setSelectedRoom(null);
  };

  const currentStatusIndex = STATUS_STEPS.findIndex((step) => step.key === order.status);
  const progress = ((currentStatusIndex + 1) / STATUS_STEPS.length) * 100;

  // Calculate cost based on services and volume
  // 0.10 USD per m³ for cleaning/humidification, 0.05 USD per m³ for aroma
  const calculateCost = (areaM2: number, ceilingHeightM: number, deviceTypes: any[] = []) => {
    const volumeM3 = areaM2 * (ceilingHeightM || 0);
    if (volumeM3 <= 0) return 0;

    let cost = 0;
    const hasCleaning = deviceTypes.some((dt) => dt.supports_cleaning);
    const hasHumidifying = deviceTypes.some((dt) => dt.supports_humidifying);
    const hasAroma = deviceTypes.some((dt) => dt.supports_aroma);

    if (hasCleaning) {
      cost += volumeM3 * 0.10;
    }
    if (hasHumidifying) {
      cost += volumeM3 * 0.10;
    }
    if (hasAroma && !(hasCleaning && hasHumidifying)) {
      // Aroma separately only if not free
      cost += volumeM3 * 0.05;
    }

    return cost;
  };

  const totalCost =
    order.rooms?.reduce((sum, room) => {
      const area = room.room?.area_m2 || 0;
      const height = room.room?.ceiling_height_m || 0;
      const deviceTypes = room.device_types || [];
      return sum + calculateCost(area, height, deviceTypes);
    }, 0) || 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Order #{order.id}</Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="solar:close-bold" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Scrollbar>
          <Stack spacing={3}>
            {/* Status timeline */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                {STATUS_STEPS.map((step, index) => {
                  const isActive = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  return (
                    <Box key={step.key} sx={{ flex: 1, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: isActive ? STATUS_COLORS[step.key] : 'grey.300',
                          color: isActive ? 'white' : 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 1,
                          border: isCurrent ? `3px solid ${STATUS_COLORS[step.key]}` : 'none',
                          boxShadow: isCurrent ? `0 0 0 4px ${STATUS_COLORS[step.key]}33` : 'none',
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isActive ? 'text.primary' : 'text.secondary',
                          fontWeight: isCurrent ? 600 : 400,
                        }}
                      >
                        {step.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: STATUS_COLORS[order.status] || 'grey.400',
                  },
                }}
              />
            </Box>

            <Divider />

            {/* Payment error */}
            {paymentError && (
              <Alert severity="error" onClose={() => setPaymentError(null)}>
                {paymentError}
              </Alert>
            )}

            {/* Order information */}
            <Stack spacing={2}>
              <Typography variant="subtitle1">Order Information</Typography>
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(order.created_at).toLocaleDateString('en-US')}
                </Typography>
                <Chip
                  label={order.status}
                  color={getStatusColor(order.status)}
                  size="small"
                />
              </Stack>
              {order.comment && (
                <Typography variant="body2">
                  <strong>Comment:</strong> {order.comment}
                </Typography>
              )}
            </Stack>

            <Divider />

            {/* Rooms */}
            {order.rooms && order.rooms.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Rooms ({order.rooms.length})
                </Typography>
                <Grid container spacing={2}>
                  {order.rooms.map((orderRoom) => (
                    <Grid item xs={12} sm={6} key={orderRoom.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': {
                            boxShadow: (theme) => theme.customShadows.z8,
                            transform: 'translateY(-2px)',
                          },
                        }}
                        onClick={() => handleOpenRoomModal(orderRoom)}
                      >
                        <CardContent>
                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2">{orderRoom.room.name}</Typography>
                              <Iconify icon="solar:arrow-right-bold" width={16} sx={{ color: 'text.secondary' }} />
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              Type: {getRoomTypeLabel(orderRoom.room.room_type)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Area: {orderRoom.room.area_m2} m²
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Ceiling Height: {orderRoom.room.ceiling_height_m} m
                            </Typography>
                            <Typography variant="caption" color="primary" fontWeight={600}>
                              Cost: ${calculateCost(
                                orderRoom.room.area_m2,
                                orderRoom.room.ceiling_height_m || 0,
                                orderRoom.device_types || []
                              ).toFixed(2)}
                            </Typography>
                            {orderRoom.device_types && orderRoom.device_types.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                  Devices:
                                </Typography>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                  {orderRoom.device_types.map((deviceType) => (
                                    <Chip
                                      key={deviceType.id}
                                      label={deviceType.name}
                                      size="small"
                                      sx={{ mb: 0.5 }}
                                    />
                                  ))}
                                </Stack>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                  <Typography variant="subtitle2">
                    Total Cost: <strong>${totalCost.toFixed(2)}</strong>
                  </Typography>
                </Box>
              </Box>
            )}

            <Divider />

            {/* Devices (if order is active) */}
            {order.status === 'ACTIVE' && order.devices && order.devices.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Devices ({order.devices.length})
                </Typography>
                <Grid container spacing={2}>
                  {order.devices.map((device) => (
                    <Grid item xs={12} sm={6} key={device.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2">{device.device_type.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Status: {device.status}
                            </Typography>
                            {device.room && (
                              <Typography variant="caption" color="text.secondary">
                                Room: {device.room.name}
                              </Typography>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Stack>
        </Scrollbar>
      </DialogContent>

      <DialogActions>
        {order.status === 'PENDING' && (
          <Button 
            variant="contained" 
            onClick={handlePay} 
            disabled={paying}
            startIcon={paying ? <Iconify icon="solar:loading-bold" /> : <Iconify icon="solar:card-bold" />}
          >
            {paying ? 'Processing...' : 'Pay'}
          </Button>
        )}
        <Button onClick={onClose} disabled={paying}>
          Close
        </Button>
      </DialogActions>

      {selectedRoom && (
        <RoomModal open={!!selectedRoom} orderRoom={selectedRoom} onClose={handleCloseRoomModal} />
      )}

      {showPaymentCardModal && (
        <PaymentCardModal
          open={showPaymentCardModal}
          onClose={() => setShowPaymentCardModal(false)}
          onSelect={handleCardSelected}
        />
      )}
    </Dialog>
  );
}

