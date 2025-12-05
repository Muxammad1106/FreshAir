import { Helmet } from 'react-helmet-async';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
// components
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
// hooks
import { useGet } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';
// types
import { DeviceInstance, PaginatedResponse } from './types';
// components
import { DeviceList } from './device-list';
import { DeviceListSkeleton } from './device-list-skeleton';

// ----------------------------------------------------------------------

export default function ClientDevicesPage() {
  const settings = useSettingsContext();

  const { data: devices, loading, error, execute } = useGet<DeviceInstance[], any>(
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

  return (
    <>
      <Helmet>
        <title> Devices | Air Purifier</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h4">Устройства</Typography>
              {!loading && devices && devices.length > 0 && (
                <Chip label={devices.length} size="small" color="primary" />
              )}
            </Stack>
            <Tooltip title="Обновить список">
              <IconButton onClick={() => execute()} disabled={loading}>
                <Iconify icon="solar:refresh-bold" />
              </IconButton>
            </Tooltip>
          </Stack>

          {loading ? <DeviceListSkeleton /> : <DeviceList devices={devices} loading={loading} error={error} />}
        </Stack>
      </Container>
    </>
  );
}

