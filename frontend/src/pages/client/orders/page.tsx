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
        // If it's an array - return as is
        if (Array.isArray(data)) {
          return data;
        }
        // If it's an object with results (DRF pagination)
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
    
    // Close create modal
    setCreateModalOpen(false);
    
    // Small delay before opening order modal
    // to ensure create modal is closed
    setTimeout(() => {
      // Open modal with order information
      console.log('Setting selected order:', order);
      setSelectedOrder(order);
      console.log('Selected order set, should open modal');
      
      // Refresh orders list
      execute();
    }, 200);
  };

  const handleOpenOrderModal = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseOrderModal = () => {
    setSelectedOrder(null);
    execute(); // Refresh orders list
  };

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      execute();
    }, 30000); // 30 seconds

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
            <Typography variant="h4">Orders</Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:refresh-bold" />}
                onClick={() => execute()}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                onClick={handleOpenCreateModal}
              >
                Create Order
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
                    Loading...
                  </Typography>
                </Box>
              );
            }
            if (error) {
              return (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Error loading orders. Please refresh the page.
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
                No Orders
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first order to install an air purification system
              </Typography>
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                onClick={handleOpenCreateModal}
              >
                Create Order
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

