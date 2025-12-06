import { useState, useEffect, useRef, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
// hooks
import { useGet, usePatch } from 'src/hooks/use-request';
// utils
import { fDate } from 'src/utils/format-time';
import { API_ENDPOINTS } from 'src/utils/axios';
// types
import { DeviceInstance, DeviceMetric } from './types';
// components
import { DeviceMetrics } from './device-metrics';
// utils
import { getDeviceCategoryColor, getDeviceCategoryLabel } from './utils';

// ----------------------------------------------------------------------

interface DeviceModalProps {
  open: boolean;
  device: DeviceInstance;
  onClose: () => void;
}

export function DeviceModal({ open, device, onClose }: DeviceModalProps) {
  const [isPowerOn, setIsPowerOn] = useState(device.is_power_on);
  const [metricsData, setMetricsData] = useState<DeviceMetric[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Загружаем метрики устройства
  const { data: metrics, loading: metricsLoading, execute: loadMetrics } = useGet<DeviceMetric[], any>(
    API_ENDPOINTS.core.customer.deviceMetrics(device.id),
    {
      immediate: false,
      transformResponse: (response) => {
        const { data } = response;
        // API возвращает {device_id, range, points: [...]}
        if (data && typeof data === 'object' && 'points' in data) {
          return (data as any).points || [];
        }
        if (Array.isArray(data)) {
          return data;
        }
        return [];
      },
    }
  );

  // Используем useRef для хранения функции loadMetrics, чтобы избежать бесконечных циклов
  const loadMetricsRef = useRef(loadMetrics);
  loadMetricsRef.current = loadMetrics;

  // Стабильная функция для загрузки метрик (без зависимости от loadMetrics)
  const loadMetricsStable = useCallback(() => {
    if (device.id) {
      loadMetricsRef.current({ url: API_ENDPOINTS.core.customer.deviceMetrics(device.id) });
    }
  }, [device.id]);

  // Переключение устройства
  const { loading: toggling, execute: toggleDevice } = usePatch(
    API_ENDPOINTS.core.customer.deviceToggle(device.id),
    {
      immediate: false,
      onSuccess: (updatedDevice: any) => {
        console.log('Device toggled, response:', updatedDevice);
        // Обновляем состояние на основе ответа от сервера
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

  // Загружаем метрики при открытии модального окна и обновляем каждые 30 секунд
  useEffect(() => {
    // Очищаем предыдущий интервал, если он есть
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!open || !device.id) {
      return undefined;
    }

    // Загружаем метрики сразу при открытии
    loadMetricsStable();
    
    // Автообновление метрик каждые 30 секунд (увеличено с 30 до 60 секунд для снижения нагрузки)
    intervalRef.current = setInterval(() => {
      loadMetricsStable();
    }, 60000); // 60 секунд вместо 30
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [open, device.id, loadMetricsStable]);

  // Обновляем метрики при получении данных
  useEffect(() => {
    if (metrics) {
      setMetricsData(metrics);
    }
  }, [metrics]);

  const handleToggle = async () => {
    await toggleDevice({
      data: { is_power_on: !isPowerOn },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={1}>
            <Typography variant="h6">{device.device_type.name}</Typography>
            <Chip
              label={getDeviceCategoryLabel(device.device_type.device_category)}
              color={getDeviceCategoryColor(device.device_type.device_category)}
              size="small"
            />
          </Stack>
          <IconButton onClick={onClose}>
            <Iconify icon="solar:close-bold" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Scrollbar>
          <Stack spacing={3}>
            {/* Информация об устройстве */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Информация об устройстве
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.disabled">
                      Статус
                    </Typography>
                    <Chip label={device.status} size="small" color="primary" />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.disabled">
                      Серийный номер
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {device.serial_number || device.internal_code || 'Не указан'}
                    </Typography>
                  </Stack>
                </Grid>
                {device.room && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <Typography variant="caption" color="text.disabled">
                          Помещение
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {device.room.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {device.room.city}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <Typography variant="caption" color="text.disabled">
                          Площадь помещения
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {device.room.area_m2} м²
                        </Typography>
                      </Stack>
                    </Grid>
                  </>
                )}
                {device.installation_date && (
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.disabled">
                        Дата установки
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {fDate(device.installation_date)}
                      </Typography>
                    </Stack>
                  </Grid>
                )}
                {device.last_service_date && (
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.disabled">
                        Последнее обслуживание
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {fDate(device.last_service_date)}
                      </Typography>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider />

            {/* Управление питанием */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Управление устройством
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPowerOn}
                    onChange={handleToggle}
                    disabled={toggling}
                    color="success"
                    size="medium"
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify
                      icon={isPowerOn ? 'solar:power-bold' : 'solar:power-bold-duotone'}
                      width={20}
                      sx={{ color: isPowerOn ? 'success.main' : 'text.disabled' }}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {isPowerOn ? 'Устройство включено' : 'Устройство выключено'}
                    </Typography>
                  </Stack>
                }
              />
            </Box>

            <Divider />

            {/* Текущие метрики */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Текущие показания
              </Typography>
              <DeviceMetrics metric={device.last_metric} deviceType={device.device_type} />
            </Box>

            <Divider />

            {/* История метрик */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1">История показаний</Typography>
                <Button
                  size="small"
                  startIcon={<Iconify icon="solar:refresh-bold" />}
                  onClick={loadMetricsStable}
                  disabled={metricsLoading}
                >
                  Обновить
                </Button>
              </Stack>

              {(() => {
                if (metricsLoading) {
                  return <Alert severity="info">Загрузка метрик...</Alert>;
                }
                if (metricsData.length === 0) {
                  return <Alert severity="info">Нет данных о метриках</Alert>;
                }
                return (
                  <Stack spacing={2}>
                    {metricsData.slice(0, 10).map((metric) => (
                      <Card key={metric.id} variant="outlined">
                        <CardContent>
                          <Stack spacing={1}>
                            <Typography variant="caption" color="text.disabled">
                              {fDate(metric.timestamp)}
                            </Typography>
                            <Grid container spacing={2}>
                              {metric.pm25 !== null && metric.pm25 !== undefined && (
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="caption" color="text.disabled">
                                    PM2.5
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {metric.pm25.toFixed(1)}
                                  </Typography>
                                </Grid>
                              )}
                              {metric.humidity !== null && metric.humidity !== undefined && (
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="caption" color="text.disabled">
                                    Влажность
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {metric.humidity.toFixed(0)}%
                                  </Typography>
                                </Grid>
                              )}
                              {metric.filter_wear_percent !== null && metric.filter_wear_percent !== undefined && (
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="caption" color="text.disabled">
                                    Износ фильтра
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {metric.filter_wear_percent.toFixed(0)}%
                                  </Typography>
                                </Grid>
                              )}
                              {metric.liquid_level_percent !== null && metric.liquid_level_percent !== undefined && (
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="caption" color="text.disabled">
                                    Уровень жидкости
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {metric.liquid_level_percent.toFixed(0)}%
                                  </Typography>
                                </Grid>
                              )}
                              {metric.cleaned_air_volume_m3 !== null && metric.cleaned_air_volume_m3 !== undefined && (
                                <Grid item xs={12}>
                                  <Typography variant="caption" color="text.disabled">
                                    Очищено воздуха
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {metric.cleaned_air_volume_m3.toFixed(1)} м³
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                    {metricsData.length > 10 && (
                      <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center' }}>
                        Показано 10 из {metricsData.length} записей
                      </Typography>
                    )}
                  </Stack>
                );
              })()}
            </Box>
          </Stack>
        </Scrollbar>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}

