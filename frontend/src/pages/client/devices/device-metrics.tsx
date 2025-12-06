import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
// components
import Iconify from 'src/components/iconify';
// utils
import { fDate } from 'src/utils/format-time';
// types
import { DeviceMetric, DeviceType } from './types';

// ----------------------------------------------------------------------

const getLiquidLevelColor = (level: number): 'error' | 'warning' | 'success' => {
  if (level < 20) return 'error';
  if (level < 50) return 'warning';
  return 'success';
};

interface DeviceMetricsProps {
  metric: DeviceMetric | null;
  deviceType?: DeviceType;
}

export function DeviceMetrics({ metric, deviceType }: DeviceMetricsProps) {
  // Используем реальные метрики (больше не генерируем фейковые, они приходят с бэкенда)
  const displayMetric = metric;
  
  if (!displayMetric) {
    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 1,
          bgcolor: (theme) => theme.palette.background.neutral,
        }}
      >
        <Typography variant="caption" color="text.disabled">
          Данные загружаются...
        </Typography>
      </Box>
    );
  }

  const isCombo = deviceType?.device_category === 'COMBO';
  const isHumidifier = deviceType?.device_category === 'HUMIDIFIER' || deviceType?.supports_humidifying;
  const isPurifier = deviceType?.device_category === 'PURIFIER' || deviceType?.supports_cleaning;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        bgcolor: (theme) => theme.palette.background.neutral,
      }}
    >
      <Typography variant="caption" color="text.disabled" sx={{ mb: 1, display: 'block' }}>
        {isCombo ? 'Показания (комбо-устройство)' : 'Последние показания'}
      </Typography>
      <Grid container spacing={2}>
        {displayMetric.pm25 !== null && displayMetric.pm25 !== undefined && (
          <Grid item xs={6}>
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="solar:wind-bold" width={16} sx={{ color: 'text.secondary' }} />
                <Typography variant="caption" color="text.disabled">
                  PM2.5
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {displayMetric.pm25.toFixed(1)}
              </Typography>
            </Stack>
          </Grid>
        )}
        {displayMetric.humidity !== null && displayMetric.humidity !== undefined && (
          <Grid item xs={6}>
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="solar:waterdrop-bold" width={16} sx={{ color: 'text.secondary' }} />
                <Typography variant="caption" color="text.disabled">
                  Влажность
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {displayMetric.humidity.toFixed(0)}%
              </Typography>
            </Stack>
          </Grid>
        )}
        {/* Износ фильтра - показываем для очистителей и комбо */}
        {(isPurifier || isCombo) && displayMetric.filter_wear_percent !== null && displayMetric.filter_wear_percent !== undefined && (
          <Grid item xs={12}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:filter-bold" width={16} sx={{ color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.disabled">
                    {isCombo ? 'Износ фильтра (очистка)' : 'Износ фильтра'}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {displayMetric.filter_wear_percent.toFixed(0)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={displayMetric.filter_wear_percent}
                color={
                  (() => {
                    if (displayMetric.filter_wear_percent > 80) return 'error';
                    if (displayMetric.filter_wear_percent > 50) return 'warning';
                    return 'success';
                  })()
                }
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Stack>
          </Grid>
        )}
        
        {/* Износ фильтра для увлажнителей (если есть) */}
        {isHumidifier && !isCombo && displayMetric.filter_wear_percent !== null && displayMetric.filter_wear_percent !== undefined && (
          <Grid item xs={12}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:filter-bold" width={16} sx={{ color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.disabled">
                    Износ фильтра
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {displayMetric.filter_wear_percent.toFixed(0)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={displayMetric.filter_wear_percent}
                color={
                  (() => {
                    if (displayMetric.filter_wear_percent > 80) return 'error';
                    if (displayMetric.filter_wear_percent > 50) return 'warning';
                    return 'success';
                  })()
                }
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Stack>
          </Grid>
        )}
        {/* Уровень жидкости - показываем для увлажнителей и комбо */}
        {(isHumidifier || isCombo) && displayMetric.liquid_level_percent !== null && displayMetric.liquid_level_percent !== undefined && (
          <Grid item xs={12}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:cup-water-bold" width={16} sx={{ color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.disabled">
                    {(() => {
                      if (isCombo) {
                        return deviceType?.supports_aroma 
                          ? 'Уровень жидкости (увлажнение + арома)' 
                          : 'Уровень жидкости (увлажнение)';
                      }
                      return 'Уровень жидкости в баке';
                    })()}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {displayMetric.liquid_level_percent.toFixed(0)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={displayMetric.liquid_level_percent}
                color={getLiquidLevelColor(displayMetric.liquid_level_percent)}
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Stack>
          </Grid>
        )}
        {displayMetric.cleaned_air_volume_m3 !== null && displayMetric.cleaned_air_volume_m3 !== undefined && (
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="solar:wind-bold" width={16} sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.disabled">
                  Очищено воздуха
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {displayMetric.cleaned_air_volume_m3.toFixed(1)} м³
                </Typography>
              </Box>
            </Stack>
          </Grid>
        )}
      </Grid>
      {displayMetric.timestamp && (
        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
          Обновлено: {fDate(displayMetric.timestamp)}
        </Typography>
      )}
    </Box>
  );
}

