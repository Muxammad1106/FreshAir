import { useState, useEffect } from 'react';
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
import { usePost } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';

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
  services: string[]; // 'cleaning', 'humidifying', 'aroma'
}

export function CreateOrderModal({ open, onClose, onOrderCreated }: CreateOrderModalProps) {
  const [rooms, setRooms] = useState<RoomFormData[]>([
    {
      name: '',
      room_type: 'HOME',
      area_m2: 0,
      ceiling_height_m: 0,
      services: [],
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Типы устройств больше не нужны для выбора, система сама подберет девайсы

  // Создание заказа
  const { loading: orderLoading, execute: createOrder, error: orderError, data: createdOrder } = usePost(
    API_ENDPOINTS.core.customer.orders,
    {
      immediate: false,
      onSuccess: (data: any) => {
        console.log('Order created - full response:', data);
        console.log('Order created - data type:', typeof data);
        console.log('Order created - data keys:', data ? Object.keys(data) : 'null');
        
        setIsSubmitting(false);
        
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
        setIsSubmitting(false);
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
        services: [],
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

  const handleServiceToggle = (roomIndex: number, service: string) => {
    const newRooms = [...rooms];
    const currentServices = newRooms[roomIndex].services;
    
    if (currentServices.includes(service)) {
      newRooms[roomIndex].services = currentServices.filter((s) => s !== service);
    } else {
      newRooms[roomIndex].services = [...currentServices, service];
    }
    
    // Если выбраны cleaning + humidifying, арома добавляется автоматически (в подарок)
    const hasCleaning = newRooms[roomIndex].services.includes('cleaning');
    const hasHumidifying = newRooms[roomIndex].services.includes('humidifying');
    const hasAroma = newRooms[roomIndex].services.includes('aroma');
    
    if (hasCleaning && hasHumidifying && !hasAroma) {
      // Добавляем арома в подарок
      newRooms[roomIndex].services = [...newRooms[roomIndex].services, 'aroma'];
    } else if (hasCleaning && hasHumidifying && hasAroma && service === 'aroma') {
      // Если пользователь пытается убрать арома при наличии cleaning + humidifying,
      // не даем убрать (арома в подарок)
      newRooms[roomIndex].services = [...newRooms[roomIndex].services, 'aroma'];
    }
    
    setRooms(newRooms);
  };

  const handleSubmit = async () => {
    // Защита от повторных отправок
    if (isSubmitting || orderLoading) {
      console.warn('Order submission already in progress');
      return;
    }

    // Валидация - проверяем каждую комнату
    const invalidRooms: number[] = [];
    rooms.forEach((room, index) => {
      const area = Number(room.area_m2);
      const height = Number(room.ceiling_height_m);
      
      if (
        !room.name || 
        !room.name.trim() ||
        !area || 
        area <= 0 || 
        Number.isNaN(area) ||
        !height || 
        height <= 0 || 
        Number.isNaN(height) ||
        !Array.isArray(room.services) ||
        room.services.length === 0
      ) {
        invalidRooms.push(index + 1);
      }
    });

    if (invalidRooms.length > 0) {
      console.error('Validation failed: invalid room data', {
        invalidRooms,
        rooms: rooms.map((r, i) => ({
          index: i + 1,
          name: r.name,
          area_m2: r.area_m2,
          ceiling_height_m: r.ceiling_height_m,
          services: r.services,
        })),
      });
      alert(`Please fill in all fields for rooms: ${invalidRooms.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    // Формируем данные для отправки - ОДИН объект с массивом rooms_data
    const orderData = {
      rooms_data: rooms.map((room) => ({
        name: room.name.trim(),
        room_type: room.room_type,
        area_m2: Number(room.area_m2),
        ceiling_height_m: Number(room.ceiling_height_m),
        services: room.services,
      })),
    };

    console.log('Submitting order with data:', orderData);
    console.log('Number of rooms in order:', orderData.rooms_data.length);
    
    try {
      const result = await createOrder({
        data: orderData,
      });
      console.log('Order creation result:', result);
    } catch (error) {
      console.error('Failed to create order:', error);
      setIsSubmitting(false);
    }
  };

  // Сброс состояния при закрытии модального окна
  useEffect(() => {
    if (!open) {
      // Сбрасываем состояние при закрытии
      setRooms([
        {
          name: '',
          room_type: 'HOME',
          area_m2: 0,
          ceiling_height_m: 0,
          services: [],
        },
      ]);
      setIsSubmitting(false);
    }
  }, [open]);

  // Расчет стоимости на основе услуг и объема
  // За 5 кубов:
  // - очистка: 50 центов = 0.50 доллара, значит за 1 куб = 0.10 доллара
  // - увлажнение: 50 центов = 0.50 доллара, значит за 1 куб = 0.10 доллара
  // - арома: 25 центов = 0.25 доллара, значит за 1 куб = 0.05 доллара
  // (или в подарок при комбо cleaning + humidifying)
  const calculateCost = (areaM2: number, ceilingHeightM: number, services: string[]) => {
    if (areaM2 <= 0 || ceilingHeightM <= 0 || services.length === 0) return '0.00';
    
    const volumeM3 = areaM2 * ceilingHeightM;
    let cost = 0;
    const hasCleaning = services.includes('cleaning');
    const hasHumidifying = services.includes('humidifying');
    const hasAroma = services.includes('aroma');
    
    // Если выбраны cleaning + humidifying, арома в подарок
    const aromaIsFree = hasCleaning && hasHumidifying;
    
    if (hasCleaning) {
      cost += volumeM3 * 0.10; // 50 центов за 5 кубов = 0.10 доллара за 1 куб
    }
    if (hasHumidifying) {
      cost += volumeM3 * 0.10; // 50 центов за 5 кубов = 0.10 доллара за 1 куб
    }
    if (hasAroma && !aromaIsFree) {
      cost += volumeM3 * 0.05; // 25 центов за 5 кубов = 0.05 доллара за 1 куб
    }
    
    return cost.toFixed(2);
  };

  const totalCost = rooms.reduce(
    (sum, room) => sum + (room.area_m2 > 0 && room.ceiling_height_m > 0 && room.services.length > 0
      ? parseFloat(calculateCost(room.area_m2, room.ceiling_height_m, room.services))
      : 0),
    0
  );


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
          <Typography variant="h6">Create Order</Typography>
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
                Error creating order. Please try again.
              </Alert>
            )}

            {createdOrder && (
              <Alert severity="success">
                Order created successfully!
              </Alert>
            )}

            {rooms.map((room, roomIndex) => (
              <Box key={roomIndex} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">Room {roomIndex + 1}</Typography>
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
                    label="Room Name"
                    value={room.name}
                    onChange={(e) => handleRoomChange(roomIndex, 'name', e.target.value)}
                    fullWidth
                    required
                    size="small"
                  />

                  <FormControl fullWidth required size="small">
                    <InputLabel>Room Type</InputLabel>
                    <Select
                      value={room.room_type}
                      label="Room Type"
                      onChange={(e) => handleRoomChange(roomIndex, 'room_type', e.target.value)}
                    >
                      <MenuItem value="HOME">Home</MenuItem>
                      <MenuItem value="COMMERCIAL">Commercial</MenuItem>
                      <MenuItem value="INDUSTRIAL">Large Enterprise</MenuItem>
                    </Select>
                  </FormControl>

                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Area (m²)"
                      type="number"
                      value={room.area_m2 || ''}
                      onChange={(e) => handleRoomChange(roomIndex, 'area_m2', parseFloat(e.target.value) || 0)}
                      fullWidth
                      required
                      size="small"
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                    <TextField
                      label="Ceiling Height (m)"
                      type="number"
                      value={room.ceiling_height_m || ''}
                      onChange={(e) => handleRoomChange(roomIndex, 'ceiling_height_m', parseFloat(e.target.value) || 0)}
                      fullWidth
                      required
                      size="small"
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </Stack>

                  {room.area_m2 > 0 && room.ceiling_height_m > 0 && room.services.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Cost: ${calculateCost(room.area_m2, room.ceiling_height_m, room.services)}
                    </Typography>
                  )}

                  <Divider />

                  <Typography variant="body2" fontWeight={600}>
                    Select Services
                  </Typography>

                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={room.services.includes('cleaning')}
                          onChange={() => handleServiceToggle(roomIndex, 'cleaning')}
                          size="small"
                        />
                      }
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>Air Cleaning</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ($0.50 per 5 m³)
                          </Typography>
                        </Stack>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={room.services.includes('humidifying')}
                          onChange={() => handleServiceToggle(roomIndex, 'humidifying')}
                          size="small"
                        />
                      }
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>Humidification</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ($0.50 per 5 m³)
                          </Typography>
                        </Stack>
                      }
                    />

                    {room.services.includes('cleaning') && room.services.includes('humidifying') ? (
                      <Box sx={{ pl: 4 }}>
                        <Typography variant="body2" color="success.main">
                          Aroma added as a bonus
                        </Typography>
                      </Box>
                    ) : (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={room.services.includes('aroma')}
                            onChange={() => handleServiceToggle(roomIndex, 'aroma')}
                            size="small"
                            disabled={false}
                          />
                        }
                        label={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography>Aroma</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ($0.25 per 5 m³)
                            </Typography>
                          </Stack>
                        }
                      />
                    )}
                  </Stack>
                </Stack>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              onClick={handleAddRoom}
              fullWidth
            >
              Add Another Room
            </Button>

            {totalCost > 0 && (
              <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  Total Cost: <strong>${totalCost.toFixed(2)}</strong>
                </Typography>
              </Box>
            )}
          </Stack>
        </Scrollbar>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={orderLoading || isSubmitting}
        >
          {orderLoading || isSubmitting ? 'Creating...' : 'Create Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

