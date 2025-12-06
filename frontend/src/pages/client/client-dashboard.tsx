import { useState } from 'react';
// @mui
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
// components
import Iconify from 'src/components/iconify';
// types
import { Room, DeviceInstance } from './devices/types';
import { Order } from './orders/types';
// components
import { CreateOrderModal } from './orders/create-order-modal';
import { OrderModal } from './orders/order-modal';

// ----------------------------------------------------------------------

interface ClientDashboardProps {
  rooms: Room[];
  devices: DeviceInstance[];
  loading: boolean;
}

export function ClientDashboard({ rooms, devices, loading }: ClientDashboardProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

