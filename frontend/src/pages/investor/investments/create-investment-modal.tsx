import { useState, useEffect, useRef, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
// hooks
import { useGet, usePost } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';
// types
import { AvailableDevice, PaginatedResponse } from './types';

// ----------------------------------------------------------------------

interface CreateInvestmentModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateInvestmentModal({ open, onClose }: CreateInvestmentModalProps) {
  const [selectedDevice, setSelectedDevice] = useState<AvailableDevice | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const budgetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadDevicesRef = useRef<any>(null);

  // Загружаем доступные устройства
  const { data: availableDevices, loading: devicesLoading, error: devicesError, execute: loadDevices } = useGet<
    AvailableDevice[],
    any
  >(API_ENDPOINTS.core.investor.devicesAvailable, {
    immediate: false,
    transformResponse: (response) => {
      const { data } = response;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && typeof data === 'object' && 'results' in data) {
        return (data as PaginatedResponse<AvailableDevice>).results || [];
      }
      return [];
    },
  });

  // Сохраняем ссылку на loadDevices
  useEffect(() => {
    loadDevicesRef.current = loadDevices;
  }, [loadDevices]);

  // Стабильная функция для загрузки устройств
  const loadDevicesStable = useCallback((budgetValue?: string) => {
    const url = budgetValue
      ? `${API_ENDPOINTS.core.investor.devicesAvailable}?budget=${budgetValue}`
      : API_ENDPOINTS.core.investor.devicesAvailable;
    if (loadDevicesRef.current) {
      loadDevicesRef.current({ url });
    }
  }, []);

  // Создание инвестиции
  const { loading: investmentLoading, execute: createInvestment, error: investmentError } = usePost(
    API_ENDPOINTS.core.investor.investments,
    {
      immediate: false,
      onSuccess: () => {
        onClose();
        setSelectedDevice(null);
        setAmount('');
        setBudget('');
      },
    }
  );

  // Загружаем устройства при открытии модального окна
  useEffect(() => {
    if (open) {
      loadDevicesStable();
    }
    return () => {
      if (budgetTimeoutRef.current) {
        clearTimeout(budgetTimeoutRef.current);
      }
    };
  }, [open, loadDevicesStable]);

  // Debounce для загрузки устройств при изменении бюджета
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    // Очищаем предыдущий таймаут
    if (budgetTimeoutRef.current) {
      clearTimeout(budgetTimeoutRef.current);
    }

    // Устанавливаем новый таймаут для загрузки через 500ms после последнего изменения
    budgetTimeoutRef.current = setTimeout(() => {
      loadDevicesStable(budget || undefined);
    }, 500);

    return () => {
      if (budgetTimeoutRef.current) {
        clearTimeout(budgetTimeoutRef.current);
      }
    };
  }, [budget, open, loadDevicesStable]);

  const handleDeviceSelect = (device: AvailableDevice) => {
    setSelectedDevice(device);
    const minAmount = parseFloat(device.min_investment_usd);
    setAmount(minAmount.toString());
  };

  const handleSubmit = async () => {
    if (!selectedDevice || !amount) {
      return;
    }

    const amountNum = parseFloat(amount);
    const minAmount = parseFloat(selectedDevice.min_investment_usd);
    const maxAmount = parseFloat(selectedDevice.max_investment_usd);

    if (amountNum < minAmount || amountNum > maxAmount) {
      return;
    }

    await createInvestment({
      data: {
        device_id: selectedDevice.id,
        amount_usd: amountNum,
      },
    });
  };

  const minAmount = selectedDevice ? parseFloat(selectedDevice.min_investment_usd) : 0;
  const maxAmount = selectedDevice ? parseFloat(selectedDevice.max_investment_usd) : 0;
  const amountNum = parseFloat(amount) || 0;
  const isValidAmount = amountNum >= minAmount && amountNum <= maxAmount;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Создать инвестицию</Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="solar:close-bold" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Scrollbar>
          <Stack spacing={3}>
            {/* Budget Filter */}
            <Box>
              <TextField
                label="Бюджет (USD)"
                type="number"
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  // Debounce будет обрабатывать загрузку устройств
                }}
                fullWidth
                placeholder="Введите ваш бюджет для фильтрации устройств"
                helperText="Оставьте пустым, чтобы увидеть все доступные устройства"
              />
            </Box>

            {/* Available Devices */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Выберите устройство
              </Typography>
              {devicesLoading && <Typography variant="body2">Загрузка устройств...</Typography>}
              {devicesError && (
                <Alert severity="error">Ошибка при загрузке устройств. Попробуйте обновить.</Alert>
              )}
              {!devicesLoading && availableDevices && availableDevices.length === 0 && (
                <Alert severity="info">Нет доступных устройств для инвестиций.</Alert>
              )}
              {!devicesLoading && availableDevices && availableDevices.length > 0 && (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {availableDevices
                    .filter((device) => {
                      // Фильтруем устройства по бюджету, если он указан
                      if (!budget) return true;
                      const budgetNum = parseFloat(budget);
                      if (Number.isNaN(budgetNum)) return true;
                      const deviceMinAmount = parseFloat(device.min_investment_usd);
                      return budgetNum >= deviceMinAmount;
                    })
                    .map((device) => {
                      const deviceMinAmount = parseFloat(device.min_investment_usd);
                      const deviceMaxAmount = parseFloat(device.max_investment_usd);
                      const budgetNum = budget ? parseFloat(budget) : null;
                      const isBudgetEnough = budgetNum === null || (budgetNum !== null && budgetNum >= deviceMinAmount);
                      const profitPercentage = device.short_projection?.profit_percentage || 25;

                      return (
                        <Card
                          key={device.id}
                          sx={{
                            cursor: isBudgetEnough ? 'pointer' : 'not-allowed',
                            border: selectedDevice?.id === device.id ? 2 : 1,
                            borderColor: selectedDevice?.id === device.id ? 'primary.main' : 'divider',
                            opacity: isBudgetEnough ? 1 : 0.5,
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: isBudgetEnough ? (theme) => theme.customShadows.z8 : 'none',
                            },
                          }}
                          onClick={() => isBudgetEnough && handleDeviceSelect(device)}
                        >
                          <CardContent>
                            <Stack spacing={1}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1">{device.device_type.name}</Typography>
                                <Chip label={device.device_type.device_category} size="small" />
                              </Stack>
                              {device.room && (
                                <Typography variant="body2" color="text.secondary">
                                  {device.room.city}, {device.room.name}
                                </Typography>
                              )}
                              <Stack direction="row" spacing={2}>
                                <Typography variant="body2" color="text.secondary">
                                  Мин: <strong>${minAmount.toFixed(2)}</strong>
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Макс: <strong>${maxAmount.toFixed(2)}</strong>
                                </Typography>
                              </Stack>
                              {device.short_projection && (
                                <Box
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: 'success.lighter',
                                  }}
                                >
                                  <Stack spacing={0.5}>
                                    <Typography variant="caption" color="success.darker" sx={{ fontWeight: 600 }}>
                                      Прогноз доходности: {profitPercentage}% за {device.short_projection.period_months} месяцев
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Пример: при инвестиции ${deviceMinAmount.toFixed(2)} → доход ${device.short_projection.projected_return_usd} через {device.short_projection.period_months} мес.
                                    </Typography>
                                  </Stack>
                                </Box>
                              )}
                              {!isBudgetEnough && budgetNum !== null && (
                                <Alert severity="warning" sx={{ mt: 1 }}>
                                  Ваш бюджет (${budgetNum.toFixed(2)}) меньше минимальной инвестиции (${deviceMinAmount.toFixed(2)})
                                </Alert>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    })}
                </Stack>
              )}
            </Box>

            {/* Investment Amount */}
            {selectedDevice && (
              <Box>
                <TextField
                  label="Сумма инвестиции (USD)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  fullWidth
                  required
                  error={!isValidAmount && amount !== ''}
                  helperText={
                    !isValidAmount && amount !== ''
                      ? `Сумма должна быть от $${minAmount} до $${maxAmount}`
                      : `Введите сумму от $${minAmount} до $${maxAmount}`
                  }
                  inputProps={{ min: minAmount, max: maxAmount, step: 0.01 }}
                />
                {selectedDevice.short_projection && amountNum >= minAmount && amountNum <= maxAmount && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Прогнозируемый доход через {selectedDevice.short_projection.period_months} месяцев:
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        $
                        {(
                          amountNum +
                          (amountNum * (selectedDevice.short_projection.profit_percentage || 25)) / 100
                        ).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Прибыль: $
                        {((amountNum * (selectedDevice.short_projection.profit_percentage || 25)) / 100).toFixed(2)} (
                        {selectedDevice.short_projection.profit_percentage || 25}%)
                      </Typography>
                    </Stack>
                  </Alert>
                )}
              </Box>
            )}

            {investmentError && (
              <Alert severity="error">Ошибка при создании инвестиции. Попробуйте еще раз.</Alert>
            )}
          </Stack>
        </Scrollbar>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedDevice || !isValidAmount || investmentLoading}
        >
          {investmentLoading ? 'Создание...' : 'Создать инвестицию'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

