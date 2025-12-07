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
    return null; // Skeleton will be displayed separately
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error loading devices. Please refresh the page.
      </Alert>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <Alert severity="info">
        You don&apos;t have any active devices yet. Please contact the administrator for installation.
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

