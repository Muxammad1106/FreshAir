import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
// types
import { Order } from './types';

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  PENDING: 'warning',
  APPROVED: 'info',
  INSTALLED: 'primary',
  ACTIVE: 'success',
  CANCELLED: 'error',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending Payment',
  APPROVED: 'Approved',
  INSTALLED: 'Installed',
  ACTIVE: 'Active',
  CANCELLED: 'Cancelled',
};

// ----------------------------------------------------------------------

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const roomsCount = order.rooms?.length || 0;
  const devicesCount = order.devices?.length || 0;

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: (theme) => theme.customShadows.z20,
          transform: 'translateY(-4px)',
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6">Order #{order.id}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>
            <Chip
              label={STATUS_LABELS[order.status] || order.status}
              color={STATUS_COLORS[order.status] || 'default'}
              size="small"
            />
          </Stack>

          <Stack spacing={1}>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Rooms: <strong>{roomsCount}</strong>
              </Typography>
              {devicesCount > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Devices: <strong>{devicesCount}</strong>
                </Typography>
              )}
            </Stack>
            {order.comment && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {order.comment}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

