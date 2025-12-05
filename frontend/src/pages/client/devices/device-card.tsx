import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
// components
import Iconify from 'src/components/iconify';
// utils
import { fDate } from 'src/utils/format-time';
// types
import { DeviceInstance } from './types';
// components
import { DeviceMetrics } from './device-metrics';
// utils
import { getDeviceCategoryColor, getDeviceCategoryLabel } from './utils';

// ----------------------------------------------------------------------

interface DeviceCardProps {
  device: DeviceInstance;
}

export function DeviceCard({ device }: DeviceCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.customShadows.z24,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {device.device_type.name}
              </Typography>
              <Chip
                label={getDeviceCategoryLabel(device.device_type.device_category)}
                color={getDeviceCategoryColor(device.device_type.device_category)}
                size="small"
              />
            </Box>
            <Tooltip title={device.is_power_on ? 'Включено' : 'Выключено'}>
              <IconButton
                size="small"
                sx={{
                  color: device.is_power_on ? 'success.main' : 'text.disabled',
                }}
              >
                <Iconify
                  icon={device.is_power_on ? 'solar:power-bold' : 'solar:power-bold-duotone'}
                  width={24}
                />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Room Info */}
          {device.room && (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="solar:home-2-bold" width={18} sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {device.room.name}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.disabled" sx={{ ml: 3 }}>
                {device.room.city}
              </Typography>
            </Box>
          )}

          {/* Serial Number */}
          <Box>
            <Typography variant="caption" color="text.disabled">
              Серийный номер:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {device.serial_number || device.internal_code}
            </Typography>
          </Box>

          {/* Last Metric */}
          {device.last_metric && <DeviceMetrics metric={device.last_metric} />}

          {/* Installation Date */}
          {device.installation_date && (
            <Typography variant="caption" color="text.disabled">
              Установлено: {fDate(device.installation_date)}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

