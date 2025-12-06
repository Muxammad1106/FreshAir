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
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
// types
import { PaymentMethod, PaymentMethodType, getPaymentMethodLabel } from './types';

// ----------------------------------------------------------------------

interface AddPaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (paymentMethod: Omit<PaymentMethod, 'id' | 'created_at'>) => void;
}

const PAYMENT_METHOD_TYPES: PaymentMethodType[] = ['UZCARD', 'VISA'];

export function AddPaymentMethodModal({ open, onClose, onAdd }: AddPaymentMethodModalProps) {
  const [type, setType] = useState<PaymentMethodType>('UZCARD');
  const [last4, setLast4] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleClose = () => {
    // Сброс формы
    setType('UZCARD');
    setLast4('');
    setCardholderName('');
    setExpiryMonth('');
    setExpiryYear('');
    setIsDefault(false);
    onClose();
  };

  const handleSubmit = () => {
    const paymentMethodData: Omit<PaymentMethod, 'id' | 'created_at'> = {
      type,
      last4: last4.slice(-4),
      cardholder_name: cardholderName,
      expiry_month: parseInt(expiryMonth, 10),
      expiry_year: parseInt(expiryYear, 10),
      is_default: isDefault,
    };

    onAdd(paymentMethodData);
    handleClose();
  };

  const isValid = () => last4.length >= 4 && cardholderName && expiryMonth && expiryYear;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Добавить метод оплаты</Typography>
          <IconButton onClick={handleClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Scrollbar>
          <Stack spacing={3} sx={{ py: 2 }}>
            {/* Payment Method Type */}
            <FormControl fullWidth>
              <InputLabel>Тип карты</InputLabel>
              <Select value={type} label="Тип карты" onChange={(e) => setType(e.target.value as PaymentMethodType)}>
                {PAYMENT_METHOD_TYPES.map((methodType) => (
                  <MenuItem key={methodType} value={methodType}>
                    {getPaymentMethodLabel(methodType)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Card Fields */}
            <TextField
              fullWidth
              label="Номер карты (последние 4 цифры)"
              value={last4}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setLast4(value);
              }}
              placeholder="1234"
              inputProps={{ maxLength: 4 }}
            />
            <TextField
              fullWidth
              label="Имя владельца карты"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="IVAN IVANOV"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Месяц</InputLabel>
                  <Select value={expiryMonth} label="Месяц" onChange={(e) => setExpiryMonth(e.target.value)}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <MenuItem key={month} value={month}>
                        {String(month).padStart(2, '0')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Год</InputLabel>
                  <Select value={expiryYear} label="Год" onChange={(e) => setExpiryYear(e.target.value)}>
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Set as Default */}
            <FormControlLabel
              control={<Checkbox checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />}
              label="Установить как метод оплаты по умолчанию"
            />
          </Stack>
        </Scrollbar>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={handleClose}>
          Отмена
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid()}>
          Добавить
        </Button>
      </DialogActions>
    </Dialog>
  );
}

