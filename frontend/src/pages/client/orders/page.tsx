import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { alpha } from '@mui/material/styles';
// components
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
// hooks
import { useGet } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';
// components
import { OrderCard } from './order-card';
import { CreateOrderModal } from './create-order-modal';
import { OrderModal } from './order-modal';
// types
import { PaginatedResponse } from '../devices/types';

// ----------------------------------------------------------------------

interface Order {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'INSTALLED' | 'ACTIVE' | 'CANCELLED';
  created_at: string;
  comment?: string;
  rooms?: any[];
  devices?: any[];
}

export default function ClientOrdersPage() {
  const settings = useSettingsContext();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, loading, error, execute } = useGet<Order[], any>(
    API_ENDPOINTS.core.customer.orders,
    {
      transformResponse: (response) => {
        const { data } = response;
        // Если это массив - возвращаем как есть
        if (Array.isArray(data)) {
          return data;
        }
        // Если это объект с results (пагинация DRF)
        if (data && typeof data === 'object' && 'results' in data) {
          return (data as PaginatedResponse<Order>).results || [];
        }
        // Fallback
        return [];
      },
    }
  );

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    execute(); // Обновляем список заказов
  };

  const handleOrderCreated = (order: Order) => {
    console.log('handleOrderCreated called with order:', order);
    console.log('handleOrderCreated - order type:', typeof order);
    console.log('handleOrderCreated - order keys:', order ? Object.keys(order) : 'null');
    
    // Закрываем модальное окно создания
    setCreateModalOpen(false);
    
    // Небольшая задержка перед открытием модального окна заказа
    // чтобы убедиться, что модальное окно создания закрылось
    setTimeout(() => {
      // Открываем модальное окно с информацией о заказе
      console.log('Setting selected order:', order);
      setSelectedOrder(order);
      console.log('Selected order set, should open modal');
      
      // Обновляем список заказов
      execute();
    }, 200);
  };

  const handleOpenOrderModal = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseOrderModal = () => {
    setSelectedOrder(null);
    execute(); // Обновляем список заказов
  };

  // Автоматическое обновление заказов каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      execute();
    }, 30000); // 30 секунд

    return () => clearInterval(interval);
  }, [execute]);

  return (
    <>
      <Helmet>
        <title> Orders | Air Purifier</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Заказы</Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:refresh-bold" />}
                onClick={() => execute()}
                disabled={loading}
              >
                Обновить
              </Button>
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                onClick={handleOpenCreateModal}
              >
                Создать заказ
              </Button>
            </Stack>
          </Stack>

          {(() => {
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
            if (error) {
              return (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Ошибка при загрузке заказов. Попробуйте обновить страницу.
                </Alert>
              );
            }
            if (!orders || orders.length === 0) {
              return (
            <Box
              sx={{
                mt: 5,
                p: 5,
                width: 1,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                border: (theme) => `dashed 1px ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Iconify icon="solar:document-add-bold" width={64} sx={{ mb: 2, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Нет заказов
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Создайте первый заказ для установки системы очистки воздуха
              </Typography>
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                onClick={handleOpenCreateModal}
              >
                Создать заказ
              </Button>
            </Box>
              );
            }
            return (
              <Grid container spacing={3}>
                {orders.map((order) => (
                  <Grid item xs={12} sm={6} md={4} key={order.id}>
                    <OrderCard order={order} onClick={() => handleOpenOrderModal(order)} />
                  </Grid>
                ))}
              </Grid>
            );
          })()}
        </Stack>
      </Container>

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

