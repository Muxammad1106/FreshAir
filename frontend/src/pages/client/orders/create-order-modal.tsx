import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
// hooks
import { useGet, usePost } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';
// types
import { DeviceType, PaginatedResponse } from '../devices/types';

// ----------------------------------------------------------------------

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  onOrderCreated?: (order: any) => void;
}

interface RoomFormData {
  name: string;
  room_type: 'HOME' | 'COMMERCIAL' | 'INDUSTRIAL';
  area_m2: number;
  ceiling_height_m: number;
  device_type_ids: number[];
}

export function CreateOrderModal({ open, onClose, onOrderCreated }: CreateOrderModalProps) {
  const [rooms, setRooms] = useState<RoomFormData[]>([
    {
      name: '',
      room_type: 'HOME',
      area_m2: 0,
      ceiling_height_m: 0,
      device_type_ids: [],
    },
  ]);

  // Загружаем типы устройств
  const { data: deviceTypes, loading: deviceTypesLoading } = useGet<DeviceType[], any>(
    API_ENDPOINTS.core.customer.deviceTypes,
    {
      transformResponse: (response) => {
        if (Array.isArray(response.data)) {
          return response.data;
        }
        if (response.data && typeof response.data === 'object' && 'results' in response.data) {
          return (response.data as PaginatedResponse<DeviceType>).results || [];
        }
        return [];
      },
    }
  );

  // Создание заказа
  const { loading: orderLoading, execute: createOrder, error: orderError, data: createdOrder } = usePost(
    API_ENDPOINTS.core.customer.orders,
    {
      immediate: false,
      onSuccess: (data: any) => {
        console.log('Order created - full response:', data);
        console.log('Order created - data type:', typeof data);
        console.log('Order created - data keys:', data ? Object.keys(data) : 'null');
        
        // API возвращает данные в response.data, но usePost уже извлекает data
        // Передаем созданный заказ в родительский компонент ПЕРЕД закрытием модального окна
        if (onOrderCreated) {
          // data может быть уже объектом заказа или обернут в response.data
          let order = data;
          
          // Если data это объект с полем order
          if (data && typeof data === 'object' && 'order' in data) {
            const { order: orderFromData } = data;
            order = orderFromData;
          }
          
          console.log('Order extracted:', order);
          console.log('Order ID:', order?.id);
          console.log('Order status:', order?.status);
          
          if (order && order.id) {
            console.log('Calling onOrderCreated with order:', order);
            // Вызываем onOrderCreated ПЕРЕД закрытием модального окна
            // Используем setTimeout чтобы убедиться, что состояние обновилось
            setTimeout(() => {
              onOrderCreated(order);
              // Закрываем модальное окно создания ПОСЛЕ вызова onOrderCreated
              setTimeout(() => {
                onClose();
              }, 50);
            }, 0);
          } else {
            console.error('Invalid order data:', order);
            console.error('Order data structure:', JSON.stringify(data, null, 2));
            // Если данные невалидны, все равно закрываем модальное окно
            onClose();
          }
        } else {
          console.warn('onOrderCreated callback is not provided');
          // Если нет колбэка, просто закрываем модальное окно
          onClose();
        }
      },
      onError: (error: any) => {
        console.error('Order creation error:', error);
      },
    }
  );

  const handleAddRoom = () => {
    setRooms([
      ...rooms,
      {
        name: '',
        room_type: 'HOME',
        area_m2: 0,
        ceiling_height_m: 0,
        device_type_ids: [],
      },
    ]);
  };

  const handleRemoveRoom = (index: number) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((_, i) => i !== index));
    }
  };

  const handleRoomChange = (index: number, field: keyof RoomFormData, value: any) => {
    const newRooms = [...rooms];
    newRooms[index] = { ...newRooms[index], [field]: value };
    setRooms(newRooms);
  };

  const handleDeviceTypeToggle = (roomIndex: number, deviceTypeId: number) => {
    const newRooms = [...rooms];
    const currentIds = newRooms[roomIndex].device_type_ids;
    if (currentIds.includes(deviceTypeId)) {
      newRooms[roomIndex].device_type_ids = currentIds.filter((id) => id !== deviceTypeId);
    } else {
      newRooms[roomIndex].device_type_ids = [...currentIds, deviceTypeId];
    }
    setRooms(newRooms);
  };

  const handleSubmit = async () => {
    // Валидация
    const hasInvalidRoom = rooms.some(
      (room) =>
        !room.name || !room.area_m2 || !room.ceiling_height_m || room.device_type_ids.length === 0
    );
    if (hasInvalidRoom) {
      console.error('Validation failed: invalid room data');
      return;
    }

    // Формируем данные для отправки
    const roomsData = rooms.map((room) => ({
      name: room.name,
      room_type: room.room_type,
      area_m2: room.area_m2,
      ceiling_height_m: room.ceiling_height_m,
      device_type_ids: room.device_type_ids,
    }));

    console.log('Submitting order with data:', { rooms_data: roomsData });
    
    try {
      const result = await createOrder({
        data: {
          rooms_data: roomsData,
        },
      });
      console.log('Order creation result:', result);
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  const calculateCost = (areaM2: number) => (areaM2 / 10).toFixed(2);

  const totalCost = rooms.reduce(
    (sum, room) => sum + (room.area_m2 > 0 ? parseFloat(calculateCost(room.area_m2)) : 0),
    0
  );

  // Фильтруем типы устройств
  const purifierTypes = deviceTypes?.filter((dt) => dt.device_category === 'PURIFIER') || [];
  const comboTypes = deviceTypes?.filter((dt) => dt.device_category === 'COMBO') || [];
  const humidifierTypes = deviceTypes?.filter((dt) => dt.device_category === 'HUMIDIFIER') || [];

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
          <Typography variant="h6">Создание заказа</Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="solar:close-bold" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Scrollbar>
          <Stack spacing={3}>
            {orderError && (
              <Alert severity="error">
                Ошибка при создании заказа. Попробуйте еще раз.
              </Alert>
            )}

            {createdOrder && (
              <Alert severity="success">
                Заказ успешно создан!
              </Alert>
            )}

            {rooms.map((room, roomIndex) => (
              <Box key={roomIndex} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">Комната {roomIndex + 1}</Typography>
                    {rooms.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveRoom(roomIndex)}
                        size="small"
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    )}
                  </Stack>

                  <TextField
                    label="Название помещения"
                    value={room.name}
                    onChange={(e) => handleRoomChange(roomIndex, 'name', e.target.value)}
                    fullWidth
                    required
                    size="small"
                  />

                  <FormControl fullWidth required size="small">
                    <InputLabel>Тип помещения</InputLabel>
                    <Select
                      value={room.room_type}
                      label="Тип помещения"
                      onChange={(e) => handleRoomChange(roomIndex, 'room_type', e.target.value)}
                    >
                      <MenuItem value="HOME">Дом</MenuItem>
                      <MenuItem value="COMMERCIAL">Коммерческое</MenuItem>
                      <MenuItem value="INDUSTRIAL">Большое предприятие</MenuItem>
                    </Select>
                  </FormControl>

                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Площадь (м²)"
                      type="number"
                      value={room.area_m2 || ''}
                      onChange={(e) => handleRoomChange(roomIndex, 'area_m2', parseFloat(e.target.value) || 0)}
                      fullWidth
                      required
                      size="small"
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                    <TextField
                      label="Высота потолка (м)"
                      type="number"
                      value={room.ceiling_height_m || ''}
                      onChange={(e) => handleRoomChange(roomIndex, 'ceiling_height_m', parseFloat(e.target.value) || 0)}
                      fullWidth
                      required
                      size="small"
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </Stack>

                  {room.area_m2 > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Стоимость: ${calculateCost(room.area_m2)}
                    </Typography>
                  )}

                  <Divider />

                  <Typography variant="body2" fontWeight={600}>
                    Выберите устройства
                  </Typography>

                  {purifierTypes.length > 0 && (
                    <Box>
                      <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                        Только очистка воздуха
                      </Typography>
                      <Stack spacing={0.5}>
                        {purifierTypes.map((deviceType) => (
                          <FormControlLabel
                            key={deviceType.id}
                            control={
                              <Checkbox
                                checked={room.device_type_ids.includes(deviceType.id)}
                                onChange={() => handleDeviceTypeToggle(roomIndex, deviceType.id)}
                                size="small"
                              />
                            }
                            label={`${deviceType.name}${deviceType.recommended_max_area_m2 ? ` (до ${deviceType.recommended_max_area_m2} м²)` : ''}`}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {comboTypes.length > 0 && (
                    <Box>
                      <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                        Очистка + увлажнение (арома в подарок)
                      </Typography>
                      <Stack spacing={0.5}>
                        {comboTypes.map((deviceType) => (
                          <FormControlLabel
                            key={deviceType.id}
                            control={
                              <Checkbox
                                checked={room.device_type_ids.includes(deviceType.id)}
                                onChange={() => handleDeviceTypeToggle(roomIndex, deviceType.id)}
                                size="small"
                              />
                            }
                            label={`${deviceType.name}${deviceType.recommended_max_area_m2 ? ` (до ${deviceType.recommended_max_area_m2} м²)` : ''}`}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {humidifierTypes.length > 0 && (
                    <Box>
                      <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                        Только увлажнение
                      </Typography>
                      <Stack spacing={0.5}>
                        {humidifierTypes.map((deviceType) => (
                          <FormControlLabel
                            key={deviceType.id}
                            control={
                              <Checkbox
                                checked={room.device_type_ids.includes(deviceType.id)}
                                onChange={() => handleDeviceTypeToggle(roomIndex, deviceType.id)}
                                size="small"
                              />
                            }
                            label={`${deviceType.name}${deviceType.recommended_max_area_m2 ? ` (до ${deviceType.recommended_max_area_m2} м²)` : ''}`}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              onClick={handleAddRoom}
              fullWidth
            >
              Добавить еще комнату
            </Button>

            {totalCost > 0 && (
              <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  Общая стоимость: <strong>${totalCost.toFixed(2)}</strong>
                </Typography>
              </Box>
            )}
          </Stack>
        </Scrollbar>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={orderLoading || deviceTypesLoading}
        >
          {orderLoading ? 'Создание...' : 'Создать заказ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

