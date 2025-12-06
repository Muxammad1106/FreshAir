import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
// components
import Iconify from 'src/components/iconify';
// types
import { PaymentMethod, getPaymentMethodLabel } from './types';

// ----------------------------------------------------------------------

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onDelete: (id: number) => void;
  onSetDefault?: (id: number) => void;
}

const getPaymentMethodIcon = (type: PaymentMethod['type']): string => 'solar:card-bold';

const formatCardNumber = (last4?: string): string => {
  if (!last4) return '';
  return `•••• •••• •••• ${last4}`;
};

export function PaymentMethodCard({ paymentMethod, onDelete, onSetDefault }: PaymentMethodCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Вы уверены, что хотите удалить этот метод оплаты?')) {
      onDelete(paymentMethod.id);
    }
  };

  const handleSetDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSetDefault) {
      onSetDefault(paymentMethod.id);
    }
  };

  return (
    <Card
      sx={{
        position: 'relative',
        transition: 'all 0.3s',
        border: (theme) => `2px solid ${paymentMethod.is_default ? theme.palette.primary.main : 'transparent'}`,
        '&:hover': {
          boxShadow: (theme) => theme.customShadows.z20,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  bgcolor: 'primary.lighter',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon={getPaymentMethodIcon(paymentMethod.type)} width={28} />
              </Box>
              <Box>
                <Typography variant="h6">{getPaymentMethodLabel(paymentMethod.type)}</Typography>
                {paymentMethod.is_default && (
                  <Chip label="По умолчанию" size="small" color="primary" sx={{ mt: 0.5 }} />
                )}
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.5}>
              {!paymentMethod.is_default && onSetDefault && (
                <Tooltip title="Установить по умолчанию">
                  <IconButton size="small" onClick={handleSetDefault}>
                    <Iconify icon="solar:star-bold" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Удалить">
                <IconButton size="small" color="error" onClick={handleDelete}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Divider />

          {/* Details */}
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Номер карты:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatCardNumber(paymentMethod.last4)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Владелец:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {paymentMethod.cardholder_name}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Срок действия:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {String(paymentMethod.expiry_month).padStart(2, '0')}/{paymentMethod.expiry_year}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Добавлено: {new Date(paymentMethod.created_at).toLocaleDateString('ru-RU')}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

