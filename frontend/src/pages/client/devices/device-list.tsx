import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
// components
import { DeviceCard } from './device-card';
// types
import { DeviceInstance } from './types';

// ----------------------------------------------------------------------

interface DeviceListProps {
  devices: DeviceInstance[] | null;
  loading: boolean;
  error: any;
}

export function DeviceList({ devices, loading, error }: DeviceListProps) {
  if (loading) {
    return null; // Skeleton будет отображаться отдельно
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Ошибка при загрузке устройств. Попробуйте обновить страницу.
      </Alert>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <Alert severity="info">
        У вас пока нет активных устройств. Обратитесь к администратору для установки.
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {devices.map((device) => (
        <Grid item xs={12} sm={6} md={4} key={device.id}>
          <DeviceCard device={device} />
        </Grid>
      ))}
    </Grid>
  );
}

