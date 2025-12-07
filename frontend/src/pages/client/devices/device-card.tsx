import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
// components
import Iconify from 'src/components/iconify';
// hooks
import { usePatch } from 'src/hooks/use-request';
// utils
import { fDate } from 'src/utils/format-time';
import { API_ENDPOINTS } from 'src/utils/axios';
// types
import { DeviceInstance } from './types';
// components
import { DeviceMetrics } from './device-metrics';
import { DeviceModal } from './device-modal';
// utils
import { getDeviceCategoryColor, getDeviceCategoryLabel } from './utils';

// ----------------------------------------------------------------------

interface DeviceCardProps {
  device: DeviceInstance;
}

export function DeviceCard({ device }: DeviceCardProps) {
  const [isPowerOn, setIsPowerOn] = useState(device.is_power_on);
  const [modalOpen, setModalOpen] = useState(false);

  const { loading: toggling, execute: toggleDevice } = usePatch(
    API_ENDPOINTS.core.customer.deviceToggle(device.id),
    {
      immediate: false,
      onSuccess: (updatedDevice: any) => {
        // Update state based on server response
        if (updatedDevice?.is_power_on !== undefined) {
          setIsPowerOn(updatedDevice.is_power_on);
        } else {
          setIsPowerOn(!isPowerOn);
        }
      },
      onError: (error: any) => {
        console.error('Failed to toggle device:', error);
      },
    }
  );

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal opening when clicking toggle
    await toggleDevice({
      data: { is_power_on: !isPowerOn },
    });
  };

  return (
    <>
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.customShadows.z24,
        },
      }}
      onClick={() => setModalOpen(true)}
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
            <Tooltip title={isPowerOn ? 'On' : 'Off'}>
              <IconButton
                size="small"
                sx={{
                  color: isPowerOn ? 'success.main' : 'text.disabled',
                }}
              >
                <Iconify
                  icon={isPowerOn ? 'solar:power-bold' : 'solar:power-bold-duotone'}
                  width={24}
                />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Power Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={isPowerOn}
                onChange={(e) => {
                  e.stopPropagation();
                  handleToggle(e as any);
                }}
                onClick={(e) => e.stopPropagation()}
                disabled={toggling}
                color="success"
              />
            }
            label={isPowerOn ? 'On' : 'Off'}
            onClick={(e) => e.stopPropagation()}
          />

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
              Serial Number:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {device.serial_number || device.internal_code}
            </Typography>
          </Box>

          {/* Coverage Area */}
          {device.device_type.coverage_area_m2 && (
            <Box>
              <Typography variant="caption" color="text.disabled">
                Coverage Area:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {device.device_type.coverage_area_m2} m²
              </Typography>
            </Box>
          )}

          {/* Last Metric */}
          <DeviceMetrics metric={device.last_metric} deviceType={device.device_type} />

          {/* Installation Date */}
          {device.installation_date && (
            <Typography variant="caption" color="text.disabled">
              Installed: {fDate(device.installation_date)}
            </Typography>
          )}

          {/* View Details Button */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Iconify icon="solar:eye-bold" />}
            onClick={(e) => {
              e.stopPropagation();
              setModalOpen(true);
            }}
          >
            View Details
          </Button>
        </Stack>
      </CardContent>
    </Card>

    <DeviceModal 
      open={modalOpen} 
      device={device} 
      onClose={() => setModalOpen(false)} 
    />
    </>
  );
}

