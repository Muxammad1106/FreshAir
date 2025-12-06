import { useState } from 'react';
// @mui
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import { alpha } from '@mui/material/styles';
// components
import Iconify from 'src/components/iconify';
// hooks
import { usePost } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';
// types
import { Room, DeviceInstance } from './devices/types';
import { Order } from './orders/types';
// components
import { CreateOrderModal } from './orders/create-order-modal';
import { OrderModal } from './orders/order-modal';

// ----------------------------------------------------------------------

const getOrderStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  if (status === 'PENDING') return 'warning';
  if (status === 'ACTIVE') return 'success';
  return 'default';
};

interface ClientDashboardProps {
  rooms: Room[];
  devices: DeviceInstance[];
  orders: Order[];
  loading: boolean;
}

export function ClientDashboard({ rooms, devices, orders, loading }: ClientDashboardProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Оплата заказа
  const { loading: paying, execute: payOrder } = usePost<Order>(
    '',
    {
      immediate: false,
      onSuccess: (data: any) => {
        console.log('Payment success:', data);
        setTimeout(() => {
          window.location.reload();
        }, 500);
      },
      onError: (error: any) => {
        console.error('Payment error:', error);
        alert(error?.message || error?.detail || error?.error || 'Ошибка при оплате заказа');
      },
    }
  );

  const handlePayOrder = async (orderId: number) => {
    try {
      await payOrder({
        url: API_ENDPOINTS.core.customer.orderPay(orderId),
        data: {},
      });
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    // Не перезагружаем страницу, если заказ был создан - модальное окно заказа откроется
    // Перезагрузка произойдет только если модальное окно закрыто без создания заказа
  };

  const handleOrderCreated = (order: Order) => {
    console.log('ClientDashboard - handleOrderCreated called with order:', order);
    console.log('ClientDashboard - order type:', typeof order);
    console.log('ClientDashboard - order keys:', order ? Object.keys(order) : 'null');
    
    // Закрываем модальное окно создания
    setCreateModalOpen(false);
    
    // Небольшая задержка перед открытием модального окна заказа
    // чтобы убедиться, что модальное окно создания закрылось
    setTimeout(() => {
      // Открываем модальное окно с информацией о заказе
      console.log('ClientDashboard - Setting selected order:', order);
      setSelectedOrder(order);
      console.log('ClientDashboard - Selected order set, should open modal');
    }, 200);
  };

  const handleCloseOrderModal = () => {
    setSelectedOrder(null);
    window.location.reload();
  };

  const pendingOrders = orders?.filter((order) => order.status === 'PENDING') || [];
  const allOrders = orders || [];
  
  if (loading) {
    return (
      <Box
        sx={{
          mt: 5,
          width: 1,
          height: 320,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Загрузка...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Client Dashboard</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={handleOpenCreateModal}
          >
            Создать заказ
          </Button>
        </Stack>

      {/* Показываем заказы со статусом PENDING */}
      {pendingOrders.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          У вас {pendingOrders.length} {pendingOrders.length === 1 ? 'заказ' : 'заказа'} ожидает оплаты
        </Alert>
      )}

      {/* Показываем все заказы, если они есть */}
      {allOrders.length > 0 && (
        <Stack spacing={2}>
          {allOrders.length > 1 && <Typography variant="h6">Все заказы</Typography>}
          {allOrders.map((order) => (
            <Card key={order.id} sx={{ mb: 2 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack spacing={1}>
                    <Typography variant="h6">Заказ #{order.id}</Typography>
                    <Chip 
                      label={order.status} 
                      color={getOrderStatusColor(order.status)} 
                      size="small" 
                    />
                    <Typography variant="body2" color="text.secondary">
                      Создан: {new Date(order.created_at).toLocaleDateString('ru-RU')}
                    </Typography>
                    {order.comment && (
                      <Typography variant="body2">{order.comment}</Typography>
                    )}
                  </Stack>
                  {order.status === 'PENDING' && (
                    <Button
                      variant="contained"
                      onClick={() => handlePayOrder(order.id)}
                      disabled={paying}
                    >
                      {paying ? 'Оплата...' : 'Оплатить'}
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Комнаты
              </Typography>
              <Typography variant="h3" color="primary">
                {rooms.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Устройства
              </Typography>
              <Typography variant="h3" color="primary">
                {devices.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Активные устройства
              </Typography>
              <Typography variant="h3" color="success.main">
                {devices.filter((d) => d.is_power_on).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box
        sx={{
          mt: 5,
          width: 1,
          height: 320,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Dashboard coming soon
        </Typography>
      </Box>
      </Stack>

      <CreateOrderModal 
        open={createModalOpen} 
        onClose={handleCloseCreateModal}
        onOrderCreated={handleOrderCreated}
      />
      {selectedOrder && (
        <OrderModal 
          key={selectedOrder.id} 
          open={!!selectedOrder} 
          order={selectedOrder} 
          onClose={handleCloseOrderModal} 
        />
      )}
    </>
  );
}

