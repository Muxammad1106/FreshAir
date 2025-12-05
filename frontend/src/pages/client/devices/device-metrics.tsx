import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// components
import Iconify from 'src/components/iconify';
// utils
import { fDate } from 'src/utils/format-time';
// types
import { DeviceMetric } from './types';

// ----------------------------------------------------------------------

interface DeviceMetricsProps {
  metric: DeviceMetric;
}

export function DeviceMetrics({ metric }: DeviceMetricsProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        bgcolor: (theme) => theme.palette.background.neutral,
      }}
    >
      <Typography variant="caption" color="text.disabled" sx={{ mb: 1, display: 'block' }}>
        Последние показания
      </Typography>
      <Grid container spacing={2}>
        {metric.pm25 !== null && metric.pm25 !== undefined && (
          <Grid item xs={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="solar:wind-bold" width={16} sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.disabled">
                  PM2.5
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {metric.pm25.toFixed(1)}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        )}
        {metric.humidity !== null && metric.humidity !== undefined && (
          <Grid item xs={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="solar:waterdrop-bold" width={16} sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.disabled">
                  Влажность
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {metric.humidity.toFixed(0)}%
                </Typography>
              </Box>
            </Stack>
          </Grid>
        )}
        {metric.filter_wear_percent !== null && metric.filter_wear_percent !== undefined && (
          <Grid item xs={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="solar:filter-bold" width={16} sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.disabled">
                  Износ фильтра
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {metric.filter_wear_percent.toFixed(0)}%
                </Typography>
              </Box>
            </Stack>
          </Grid>
        )}
        {metric.liquid_level_percent !== null && metric.liquid_level_percent !== undefined && (
          <Grid item xs={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="solar:cup-water-bold" width={16} sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.disabled">
                  Уровень жидкости
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {metric.liquid_level_percent.toFixed(0)}%
                </Typography>
              </Box>
            </Stack>
          </Grid>
        )}
        {metric.cleaned_air_volume_m3 !== null && metric.cleaned_air_volume_m3 !== undefined && (
          <Grid item xs={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="solar:wind-bold" width={16} sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.disabled">
                  Очищено воздуха
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {metric.cleaned_air_volume_m3.toFixed(1)} м³
                </Typography>
              </Box>
            </Stack>
          </Grid>
        )}
      </Grid>
      {metric.timestamp && (
        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
          {fDate(metric.timestamp)}
        </Typography>
      )}
    </Box>
  );
}

