import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
// components
import Iconify from 'src/components/iconify';
// types
import { Transaction } from './types';

// ----------------------------------------------------------------------

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const STATUS_COLORS: Record<Transaction['status'], 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  FAILED: 'error',
  CANCELLED: 'default',
};

const STATUS_LABELS: Record<Transaction['status'], string> = {
  PENDING: 'В обработке',
  COMPLETED: 'Завершена',
  FAILED: 'Ошибка',
  CANCELLED: 'Отменена',
};

const getTransactionIcon = (type: Transaction['type']): string => {
  switch (type) {
    case 'PAYMENT':
      return 'solar:card-send-bold';
    case 'REFUND':
      return 'solar:card-receive-bold';
    case 'SUBSCRIPTION':
      return 'solar:card-send-bold';
    default:
      return 'solar:wallet-money-bold';
  }
};

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <Box
        sx={{
          mt: 5,
          p: 5,
          width: 1,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Iconify icon="solar:document-text-bold" width={64} sx={{ mb: 2, color: 'text.secondary' }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Нет транзакций
        </Typography>
        <Typography variant="body2" color="text.secondary">
          История ваших транзакций будет отображаться здесь
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {transactions.map((transaction) => (
        <Card
          key={transaction.id}
          sx={{
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: (theme) => theme.customShadows.z20,
              transform: 'translateY(-2px)',
            },
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon={getTransactionIcon(transaction.type)} width={24} />
                  </Box>
                  <Stack flex={1}>
                    <Typography variant="subtitle1">{transaction.description}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(transaction.created_at).toLocaleString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack alignItems="flex-end" spacing={0.5}>
                  <Typography
                    variant="h6"
                    color={
                      (() => {
                        if (transaction.type === 'REFUND') return 'success.main';
                        if (transaction.status === 'COMPLETED') return 'text.primary';
                        return 'text.secondary';
                      })()
                    }
                  >
                    {transaction.type === 'REFUND' ? '+' : '-'}
                    {transaction.amount_usd.toFixed(2)} $
                  </Typography>
                  <Chip
                    label={STATUS_LABELS[transaction.status]}
                    color={STATUS_COLORS[transaction.status]}
                    size="small"
                  />
                </Stack>
              </Stack>

              {(transaction.payment_method || transaction.order_id) && (
                <>
                  <Divider />
                  <Stack direction="row" spacing={3} flexWrap="wrap">
                    {transaction.payment_method && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:card-bold" width={16} sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {transaction.payment_method.type} •••• {transaction.payment_method.last4}
                        </Typography>
                      </Stack>
                    )}
                    {transaction.order_id && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:document-bold" width={16} sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Заказ #{transaction.order_id}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

