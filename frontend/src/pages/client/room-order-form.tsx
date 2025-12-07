import { useState } from 'react';
// @mui
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
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
// hooks
import { useGet, usePost } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';
// types
import { DeviceType, PaginatedResponse } from './devices/types';

// ----------------------------------------------------------------------

interface RoomFormData {
  name: string;
  room_type: 'HOME' | 'COMMERCIAL' | 'INDUSTRIAL';
  area_m2: number;
  ceiling_height_m: number;
  device_type_ids: number[];
}

export function RoomOrderForm() {
  const [rooms, setRooms] = useState<RoomFormData[]>([
    {
      name: '',
      room_type: 'HOME',
      area_m2: 0,
      ceiling_height_m: 0,
      device_type_ids: [],
    },
  ]);

  // Load device types
  const { data: deviceTypes, loading: deviceTypesLoading, error: deviceTypesError } = useGet<DeviceType[], any>(
    API_ENDPOINTS.core.customer.deviceTypes,
    {
      transformResponse: (response) => {
        // API may return either an array directly or an object with results
        if (Array.isArray(response.data)) {
          return response.data;
        }
        // If it's an object with results (pagination)
        if (response.data && typeof response.data === 'object' && 'results' in response.data) {
          return (response.data as PaginatedResponse<DeviceType>).results || [];
        }
        // Fallback
        return [];
      },
    }
  );

  // Create order
  const { loading: orderLoading, execute: createOrder, error: orderError, data: createdOrder } = usePost(
    API_ENDPOINTS.core.customer.orders,
    {
      immediate: false,
      onSuccess: (data) => {
        // After successfully creating an order, refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
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
    // Validation
    const hasInvalidRoom = rooms.some(
      (room) =>
        !room.name || !room.area_m2 || !room.ceiling_height_m || room.device_type_ids.length === 0
    );
    if (hasInvalidRoom) {
      return;
    }

    // Prepare data for submission
    const roomsData = rooms.map((room) => ({
      name: room.name,
      room_type: room.room_type,
      area_m2: room.area_m2,
      ceiling_height_m: room.ceiling_height_m,
      device_type_ids: room.device_type_ids,
    }));

    await createOrder({
      data: {
        rooms_data: roomsData,
      },
    });
  };

  // Filter device types for convenience
  const purifierTypes = deviceTypes?.filter((dt) => dt.device_category === 'PURIFIER') || [];
  const comboTypes = deviceTypes?.filter((dt) => dt.device_category === 'COMBO') || [];
  const humidifierTypes = deviceTypes?.filter((dt) => dt.device_category === 'HUMIDIFIER') || [];
  const aromaTypes = deviceTypes?.filter((dt) => dt.device_category === 'AROMA') || [];

  // Format price
  const formatPrice = (price?: string | number) => {
    if (!price) return '';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numPrice.toFixed(2)}`;
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Create Order</Typography>
      <Typography variant="body2" color="text.secondary">
        Fill in room information and select devices for installation
      </Typography>

      {orderError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error creating order. Please try again.
        </Alert>
      )}

      {deviceTypesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading devices. Please refresh the page.
        </Alert>
      )}

      {createdOrder && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Order created successfully! The page will refresh in a second...
        </Alert>
      )}

      {rooms.map((room, roomIndex) => (
        <Card key={roomIndex}>
          <CardContent>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Room {roomIndex + 1}</Typography>
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
              />

              <FormControl fullWidth required>
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
                  inputProps={{ min: 0, step: 0.1 }}
                />
                <TextField
                  label="Ceiling Height (m)"
                  type="number"
                  value={room.ceiling_height_m || ''}
                  onChange={(e) => handleRoomChange(roomIndex, 'ceiling_height_m', parseFloat(e.target.value) || 0)}
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Stack>

              <Divider />

              <Typography variant="subtitle2">Select Devices</Typography>

              {deviceTypesLoading && (
                <Typography variant="body2" color="text.secondary">
                  Loading devices...
                </Typography>
              )}

              {!deviceTypesLoading && (!deviceTypes || deviceTypes.length === 0) && (
                <Alert severity="warning">
                  No devices found. Please contact the administrator.
                  {deviceTypesError && ` Error: ${JSON.stringify(deviceTypesError)}`}
                </Alert>
              )}

              {/* Show all available devices for debugging */}
              {deviceTypes && deviceTypes.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total devices available: {deviceTypes.length}
                  </Typography>
                </Box>
              )}

              {/* Purifier */}
              {purifierTypes.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Air Purification Only
                  </Typography>
                  <Stack spacing={1}>
                    {purifierTypes.map((deviceType) => (
                      <FormControlLabel
                        key={deviceType.id}
                        control={
                          <Checkbox
                            checked={room.device_type_ids.includes(deviceType.id)}
                            onChange={() => handleDeviceTypeToggle(roomIndex, deviceType.id)}
                          />
                        }
                        label={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography>
                              {deviceType.name} (up to {deviceType.recommended_max_area_m2} m²)
                            </Typography>
                            {deviceType.price_usd && (
                              <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                                {formatPrice(deviceType.price_usd)}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Combo (purification + humidification + aroma) */}
              {comboTypes.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Purification + Humidification + Aroma
                  </Typography>
                  <Stack spacing={1}>
                    {comboTypes.map((deviceType) => (
                      <FormControlLabel
                        key={deviceType.id}
                        control={
                          <Checkbox
                            checked={room.device_type_ids.includes(deviceType.id)}
                            onChange={() => handleDeviceTypeToggle(roomIndex, deviceType.id)}
                          />
                        }
                        label={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography>
                              {deviceType.name} (up to {deviceType.recommended_max_area_m2} m²)
                            </Typography>
                            {deviceType.price_usd && (
                              <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                                {formatPrice(deviceType.price_usd)}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Humidifier (if available) */}
              {humidifierTypes.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Humidification Only
                  </Typography>
                  <Stack spacing={1}>
                    {humidifierTypes.map((deviceType) => (
                      <FormControlLabel
                        key={deviceType.id}
                        control={
                          <Checkbox
                            checked={room.device_type_ids.includes(deviceType.id)}
                            onChange={() => handleDeviceTypeToggle(roomIndex, deviceType.id)}
                          />
                        }
                        label={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography>
                              {deviceType.name} (up to {deviceType.recommended_max_area_m2} m²)
                            </Typography>
                            {deviceType.price_usd && (
                              <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                                {formatPrice(deviceType.price_usd)}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Aromatizer (separate) */}
              {aromaTypes.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Aromatizer (Separate)
                  </Typography>
                  <Stack spacing={1}>
                    {aromaTypes.map((deviceType) => (
                      <FormControlLabel
                        key={deviceType.id}
                        control={
                          <Checkbox
                            checked={room.device_type_ids.includes(deviceType.id)}
                            onChange={() => handleDeviceTypeToggle(roomIndex, deviceType.id)}
                          />
                        }
                        label={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography>{deviceType.name}</Typography>
                            {deviceType.price_usd && (
                              <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                                {formatPrice(deviceType.price_usd)}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outlined"
        startIcon={<Iconify icon="solar:add-circle-bold" />}
        onClick={handleAddRoom}
      >
        Add Another Room
      </Button>

      <Button
        variant="contained"
        size="large"
        onClick={handleSubmit}
        disabled={orderLoading || deviceTypesLoading}
        fullWidth
      >
        {orderLoading ? 'Creating Order...' : 'Create Order'}
      </Button>
    </Stack>
  );
}

