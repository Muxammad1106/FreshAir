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
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
// types
import { OrderRoom } from './types';

// ----------------------------------------------------------------------

interface RoomModalProps {
  open: boolean;
  orderRoom: OrderRoom;
  onClose: () => void;
}

const getRoomTypeLabel = (roomType: string): string => {
  if (roomType === 'HOME') return 'Дом';
  if (roomType === 'COMMERCIAL') return 'Коммерческое';
  return 'Большое предприятие';
};

const getDeviceCategoryColor = (category: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  if (category === 'PURIFIER') return 'primary';
  if (category === 'COMBO') return 'success';
  return 'default';
};

export function RoomModal({ open, orderRoom, onClose }: RoomModalProps) {
  const calculateCost = (areaM2: number) => (areaM2 / 10).toFixed(2);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{orderRoom.room.name}</Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="solar:close-bold" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Scrollbar>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Тип помещения
              </Typography>
              <Chip label={getRoomTypeLabel(orderRoom.room.room_type)} size="small" />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Площадь
                  </Typography>
                  <Typography variant="h6">{orderRoom.room.area_m2} м²</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Высота потолка
                  </Typography>
                  <Typography variant="h6">{orderRoom.room.ceiling_height_m} м</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Объем
                  </Typography>
                  <Typography variant="h6">
                    {(orderRoom.room.area_m2 * orderRoom.room.ceiling_height_m).toFixed(1)} м³
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Стоимость
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${calculateCost(orderRoom.room.area_m2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {orderRoom.device_types && orderRoom.device_types.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Устройства ({orderRoom.device_types.length})
                </Typography>
                <Grid container spacing={2}>
                  {orderRoom.device_types.map((deviceType) => (
                    <Grid item xs={12} sm={6} key={deviceType.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2">{deviceType.name}</Typography>
                            <Chip
                              label={deviceType.device_category}
                              size="small"
                              color={getDeviceCategoryColor(deviceType.device_category)}
                            />
                            {deviceType.recommended_max_area_m2 && (
                              <Typography variant="caption" color="text.secondary">
                                До {deviceType.recommended_max_area_m2} м²
                              </Typography>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Stack>
        </Scrollbar>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}

