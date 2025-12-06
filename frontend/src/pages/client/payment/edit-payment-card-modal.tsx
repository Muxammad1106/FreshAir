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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
// hooks
import { usePatch } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';
// types
import { PaymentMethod, PaymentMethodType, getPaymentMethodLabel } from './types';

// ----------------------------------------------------------------------

interface EditPaymentCardModalProps {
  open: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethod | null;
  onSuccess: () => void;
}

const PAYMENT_METHOD_TYPES: PaymentMethodType[] = ['UZCARD', 'VISA', 'Mastercard', 'American Express'];

export function EditPaymentCardModal({ open, onClose, paymentMethod, onSuccess }: EditPaymentCardModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [type, setType] = useState<PaymentMethodType>('UZCARD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Заполняем форму при открытии модалки
  useEffect(() => {
    if (paymentMethod && open) {
      setType(paymentMethod.type);
      // Показываем последние 4 цифры как начальное значение, но пользователь может ввести полный номер
      setCardNumber(paymentMethod.last4);
      setCardholderName(paymentMethod.cardholder_name);
      setExpiryMonth(String(paymentMethod.expiry_month));
      setExpiryYear(String(paymentMethod.expiry_year));
      setCvv('');
      setIsDefault(paymentMethod.is_default);
      setFormErrors({});
      setIsEditMode(false); // По умолчанию режим просмотра
    }
  }, [paymentMethod, open]);

  // Обновление карты
  const { loading: updating, execute: updateCard } = usePatch(
    paymentMethod ? API_ENDPOINTS.core.customer.paymentCard(paymentMethod.id) : '',
    {
      immediate: false,
      onSuccess: () => {
        onSuccess();
        setIsEditMode(false);
        handleClose();
      },
      onError: (error: any) => {
        if (error && typeof error === 'object') {
          setFormErrors(error);
        } else {
          setFormErrors({ general: 'Ошибка при обновлении карты' });
        }
      },
    }
  );

  const handleClose = () => {
    setFormErrors({});
    setIsEditMode(false);
    onClose();
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    // Восстанавливаем исходные значения
    if (paymentMethod) {
      setType(paymentMethod.type);
      setCardNumber(paymentMethod.last4);
      setCardholderName(paymentMethod.cardholder_name);
      setExpiryMonth(String(paymentMethod.expiry_month));
      setExpiryYear(String(paymentMethod.expiry_year));
      setCvv('');
      setIsDefault(paymentMethod.is_default);
    }
    setFormErrors({});
    setIsEditMode(false);
  };

  const handleSubmit = () => {
    // Валидация
    const errors: Record<string, string> = {};
    
    // Очищаем номер карты от пробелов и дефисов
    const cleanedCardNumber = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
    const originalLast4 = paymentMethod?.last4 || '';
    
    if (!cleanedCardNumber || cleanedCardNumber.length < 4) {
      errors.card_number = 'Введите номер карты (минимум 4 цифры)';
    } else if (!/^\d+$/.test(cleanedCardNumber)) {
      errors.card_number = 'Номер карты должен содержать только цифры';
    } else if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      errors.card_number = 'Номер карты должен содержать от 13 до 19 цифр';
    }
    
    if (!cardholderName.trim()) {
      errors.cardholder_name = 'Введите имя владельца карты';
    }
    
    if (!expiryMonth) {
      errors.expiry_month = 'Выберите месяц';
    }
    
    if (!expiryYear) {
      errors.expiry_year = 'Выберите год';
    }

    // CVV обязателен только если меняется номер карты
    if (cleanedCardNumber.length >= 13 && cleanedCardNumber.slice(-4) !== originalLast4) {
      if (!cvv || cvv.length < 3 || cvv.length > 4) {
        errors.cvv = 'Введите CVV код (3-4 цифры)';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const updateData: any = {
      card_number: cleanedCardNumber,
      cardholder_name: cardholderName.trim(),
      expiry_month: parseInt(expiryMonth, 10),
      expiry_year: parseInt(expiryYear, 10),
      cvv,
      is_default: isDefault,
    };

    if (type !== paymentMethod?.type) {
      updateData.brand = type;
    }

    updateCard({
      url: API_ENDPOINTS.core.customer.paymentCard(paymentMethod!.id),
      data: updateData,
    });
  };

  const isValid = () => {
    const cleanedCardNumber = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
    const originalLast4 = paymentMethod?.last4 || '';
    const cardNumberChanged = cleanedCardNumber.length >= 13 && cleanedCardNumber.slice(-4) !== originalLast4;
    
    return cleanedCardNumber.length >= 13 && 
           cleanedCardNumber.length <= 19 && 
           /^\d+$/.test(cleanedCardNumber) &&
           cardholderName.trim() && 
           expiryMonth && 
           expiryYear &&
           (!cardNumberChanged || (cvv.length >= 3 && cvv.length <= 4));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);

  if (!paymentMethod) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Редактировать карту</Typography>
          <IconButton onClick={handleClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Scrollbar>
          <Stack spacing={3} sx={{ py: 2 }}>
            {formErrors.general && (
              <Alert severity="error">{formErrors.general}</Alert>
            )}

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
              label="Номер карты"
              value={cardNumber}
              onChange={(e) => {
                // Разрешаем ввод полного номера карты с форматированием
                let value = e.target.value.replace(/\D/g, '');
                // Форматируем с пробелами каждые 4 цифры
                if (value.length > 0) {
                  value = value.match(/.{1,4}/g)?.join(' ') || value;
                }
                setCardNumber(value);
                if (formErrors.card_number) {
                  setFormErrors({ ...formErrors, card_number: '' });
                }
              }}
              placeholder="1234 5678 9012 3456"
              inputProps={{ maxLength: 19 }}
              error={!!formErrors.card_number}
              helperText={formErrors.card_number || (isEditMode ? 'Введите полный номер карты' : '')}
              disabled={!isEditMode}
            />
            {isEditMode && (
              <TextField
                fullWidth
                label="CVV"
                value={cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setCvv(value);
                  if (formErrors.cvv) {
                    setFormErrors({ ...formErrors, cvv: '' });
                  }
                }}
                placeholder="123"
                inputProps={{ maxLength: 4 }}
                error={!!formErrors.cvv}
                helperText={formErrors.cvv}
                type="password"
              />
            )}
            <TextField
              fullWidth
              label="Имя владельца карты"
              value={cardholderName}
              onChange={(e) => {
                setCardholderName(e.target.value);
                if (formErrors.cardholder_name) {
                  setFormErrors({ ...formErrors, cardholder_name: '' });
                }
              }}
              placeholder="IVAN IVANOV"
              error={!!formErrors.cardholder_name}
              helperText={formErrors.cardholder_name}
              disabled={!isEditMode}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth error={!!formErrors.expiry_month} disabled={!isEditMode}>
                  <InputLabel>Месяц</InputLabel>
                  <Select value={expiryMonth} label="Месяц" onChange={(e) => {
                    setExpiryMonth(e.target.value);
                    if (formErrors.expiry_month) {
                      setFormErrors({ ...formErrors, expiry_month: '' });
                    }
                  }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <MenuItem key={month} value={month}>
                        {String(month).padStart(2, '0')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth error={!!formErrors.expiry_year} disabled={!isEditMode}>
                  <InputLabel>Год</InputLabel>
                  <Select value={expiryYear} label="Год" onChange={(e) => {
                    setExpiryYear(e.target.value);
                    if (formErrors.expiry_year) {
                      setFormErrors({ ...formErrors, expiry_year: '' });
                    }
                  }}>
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
              control={<Checkbox checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} disabled={!isEditMode} />}
              label="Использовать как карту по умолчанию"
            />
          </Stack>
        </Scrollbar>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {!isEditMode ? (
          <>
            <Button variant="outlined" onClick={handleClose}>
              Закрыть
            </Button>
            <Button variant="contained" onClick={handleEdit}>
              Редактировать
            </Button>
          </>
        ) : (
          <>
            <Button variant="outlined" onClick={handleCancelEdit} disabled={updating}>
              Отмена
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={!isValid() || updating}>
              {updating ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

