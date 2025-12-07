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

  // Check for rooms
  const { data: rooms, loading: roomsLoading } = useGet<Room[], any>(
    API_ENDPOINTS.core.customer.rooms,
    {
      transformResponse: (response) => {
        const { data } = response;
        // If it's an array - return as is
        if (Array.isArray(data)) {
          return data;
        }
        // If it's an object with results (pagination)
        if (data && typeof data === 'object' && 'results' in data) {
          return (data as PaginatedResponse<Room>).results || [];
        }
        // Fallback
        return [];
      },
    }
  );

  // Check for devices
  const { data: devices, loading: devicesLoading } = useGet<DeviceInstance[], any>(
    API_ENDPOINTS.core.customer.devices,
    {
      transformResponse: (response) => {
        const { data } = response;
        // If it's an array - return as is
        if (Array.isArray(data)) {
          return data;
        }
        // If it's an object with results (pagination)
        if (data && typeof data === 'object' && 'results' in data) {
          return (data as PaginatedResponse<DeviceInstance>).results || [];
        }
        // Fallback
        return [];
      },
    }
  );

  const loading = roomsLoading || devicesLoading;
  const hasRooms = rooms && rooms.length > 0;
  const hasDevices = devices && devices.length > 0;
  // Show form only if no rooms and devices
  const showOrderForm = !loading && !hasRooms && !hasDevices;
  
  // If there are rooms or devices - show dashboard
  const showDashboard = !loading && (hasRooms || hasDevices);

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
              loading={loading} 
            />
          )
        )}
      </Container>
    </>
  );
}

