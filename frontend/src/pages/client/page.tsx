import { Helmet } from 'react-helmet-async';
// @mui
import Container from '@mui/material/Container';
// components
import { useSettingsContext } from 'src/components/settings';
// hooks
import { useGet } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';
// components
import { RoomOrderForm } from './room-order-form';
import { ClientDashboard } from './client-dashboard';
// types
import { Room, DeviceInstance, PaginatedResponse } from './devices/types';

// ----------------------------------------------------------------------

export default function ClientPage() {
  const settings = useSettingsContext();

  // Проверяем наличие комнат
  const { data: rooms, loading: roomsLoading } = useGet<Room[], any>(
    API_ENDPOINTS.core.customer.rooms,
    {
      transformResponse: (response) => {
        const { data } = response;
        // Если это массив - возвращаем как есть
        if (Array.isArray(data)) {
          return data;
        }
        // Если это объект с results (пагинация)
        if (data && typeof data === 'object' && 'results' in data) {
          return (data as PaginatedResponse<Room>).results || [];
        }
        // Fallback
        return [];
      },
    }
  );

  // Проверяем наличие устройств
  const { data: devices, loading: devicesLoading } = useGet<DeviceInstance[], any>(
    API_ENDPOINTS.core.customer.devices,
    {
      transformResponse: (response) => {
        const { data } = response;
        // Если это массив - возвращаем как есть
        if (Array.isArray(data)) {
          return data;
        }
        // Если это объект с results (пагинация)
        if (data && typeof data === 'object' && 'results' in data) {
          return (data as PaginatedResponse<DeviceInstance>).results || [];
        }
        // Fallback
        return [];
      },
    }
  );

  // Проверяем наличие заказов
  const { data: orders, loading: ordersLoading } = useGet<any[], any>(
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
          return (data as PaginatedResponse<any>).results || [];
        }
        // Fallback
        return [];
      },
    }
  );

  const loading = roomsLoading || devicesLoading || ordersLoading;
  const hasRooms = rooms && rooms.length > 0;
  const hasDevices = devices && devices.length > 0;
  const hasOrders = orders && orders.length > 0;
  // Показываем форму только если нет комнат, устройств И заказов
  const showOrderForm = !loading && !hasRooms && !hasDevices && !hasOrders;
  
  // Если есть заказы, но нет устройств - показываем дашборд с информацией о заказах
  const showDashboard = !loading && (hasRooms || hasDevices || hasOrders);

  return (
    <>
      <Helmet>
        <title> Client Dashboard | Air Purifier</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        {showOrderForm ? (
          <RoomOrderForm />
        ) : (
          showDashboard && (
            <ClientDashboard 
              rooms={rooms || []} 
              devices={devices || []} 
              orders={orders || []}
              loading={loading} 
            />
          )
        )}
      </Container>
    </>
  );
}

