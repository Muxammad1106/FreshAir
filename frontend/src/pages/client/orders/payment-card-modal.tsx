import { useState, useEffect, useRef, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
// hooks
import { useGet, usePost } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';

// ----------------------------------------------------------------------

export interface PaymentCard {
  id: number;
  card_number_last4: string;
  cardholder_name: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  brand?: string;
  created_at: string;
}

interface PaymentCardModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (cardId: number) => void;
}

export function PaymentCardModal({ open, onClose, onSelect }: PaymentCardModalProps) {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    card_number: '',
    cardholder_name: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    is_default: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Загружаем список карт
  const { data: cardsData, execute: loadCards } = useGet<PaymentCard[], any>(
    API_ENDPOINTS.core.customer.paymentCards,
    {
      immediate: false,
      transformResponse: (response) => {
        const { data } = response;
        if (Array.isArray(data)) {
          return data;
        }
        if (data && typeof data === 'object' && 'results' in data) {
          return (data as any).results || [];
        }
        return [];
      },
    }
  );

  // Используем useRef для хранения функции loadCards, чтобы избежать бесконечных циклов
  const loadCardsRef = useRef(loadCards);
  loadCardsRef.current = loadCards;

  // Стабильная функция для загрузки карт (без зависимости от loadCards)
  const loadCardsStable = useCallback(() => {
    loadCardsRef.current({ url: API_ENDPOINTS.core.customer.paymentCards });
  }, []);

  // Создание новой карты
  const { loading: creating, execute: createCard } = usePost(
    API_ENDPOINTS.core.customer.paymentCards,
    {
      immediate: false,
      onSuccess: () => {
        setShowAddForm(false);
        setFormData({
          card_number: '',
          cardholder_name: '',
          expiry_month: '',
          expiry_year: '',
          cvv: '',
          is_default: false,
        });
        setFormErrors({});
        loadCardsStable();
      },
      onError: (error: any) => {
        const errorMessage = error?.message || error?.detail || error?.error || 'Ошибка при добавлении карты';
        setFormErrors({ general: errorMessage });
      },
    }
  );

  useEffect(() => {
    if (open) {
      loadCardsStable();
      setShowAddForm(false);
      setSelectedCardId(null);
    }
  }, [open, loadCardsStable]);

  const handleSelectCard = (cardId: number) => {
    setSelectedCardId(cardId);
  };

  const handleConfirm = () => {
    if (showAddForm) {
      // Валидация формы
      const errors: Record<string, string> = {};
      if (!formData.card_number.replace(/\s/g, '').match(/^\d{13,19}$/)) {
        errors.card_number = 'Номер карты должен содержать от 13 до 19 цифр';
      }
      if (!formData.cardholder_name.trim()) {
        errors.cardholder_name = 'Введите имя держателя карты';
      }
      const expiryMonthNum = parseInt(formData.expiry_month, 10);
      if (!formData.expiry_month || Number.isNaN(expiryMonthNum) || expiryMonthNum < 1 || expiryMonthNum > 12) {
        errors.expiry_month = 'Введите корректный месяц (1-12)';
      }
      const currentYear = new Date().getFullYear();
      const expiryYearNum = parseInt(formData.expiry_year, 10);
      if (!formData.expiry_year || Number.isNaN(expiryYearNum) || expiryYearNum < currentYear || expiryYearNum > currentYear + 20) {
        errors.expiry_year = `Введите корректный год (${currentYear}-${currentYear + 20})`;
      }
      if (!formData.cvv || !formData.cvv.match(/^\d{3,4}$/)) {
        errors.cvv = 'CVV должен содержать 3-4 цифры';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      // Создаем карту
      createCard({
        data: {
          card_number: formData.card_number.replace(/\s/g, ''),
          cardholder_name: formData.cardholder_name.trim(),
          expiry_month: parseInt(formData.expiry_month, 10),
          expiry_year: parseInt(formData.expiry_year, 10),
          cvv: formData.cvv,
          is_default: formData.is_default || cardsData?.length === 0,
        },
      });
    } else if (selectedCardId) {
      onSelect(selectedCardId);
      onClose();
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData({ ...formData, card_number: formatted });
    if (formErrors.card_number) {
      setFormErrors({ ...formErrors, card_number: '' });
    }
  };

  const cards = cardsData || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {(() => {
              if (showAddForm) return 'Добавить карту';
              if (cards.length > 0) return 'Выберите карту';
              return 'Добавьте карту для оплаты';
            })()}
          </Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="solar:close-bold" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Scrollbar>
          <Stack spacing={3}>
            {!showAddForm && cards.length > 0 && (
              <>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={selectedCardId || ''}
                    onChange={(e) => handleSelectCard(parseInt(e.target.value, 10))}
                  >
                    <Stack spacing={2}>
                      {cards.map((card) => (
                        <Card
                          key={card.id}
                          variant="outlined"
                          sx={{
                            cursor: 'pointer',
                            border: selectedCardId === card.id ? 2 : 1,
                            borderColor: selectedCardId === card.id ? 'primary.main' : 'divider',
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: (theme) => theme.customShadows.z8,
                            },
                          }}
                          onClick={() => handleSelectCard(card.id)}
                        >
                          <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Radio value={card.id} checked={selectedCardId === card.id} />
                              <Box sx={{ flex: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {card.cardholder_name}
                                  </Typography>
                                  {card.is_default && (
                                    <Chip label="По умолчанию" size="small" color="primary" />
                                  )}
                                  {card.brand && (
                                    <Chip label={card.brand} size="small" variant="outlined" />
                                  )}
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                  **** **** **** {card.card_number_last4}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {String(card.expiry_month).padStart(2, '0')}/{card.expiry_year}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </RadioGroup>
                </FormControl>

                <Divider>
                  <Typography variant="caption" color="text.secondary">
                    или
                  </Typography>
                </Divider>
              </>
            )}

            {showAddForm ? (
              <Stack spacing={2}>
                {formErrors.general && (
                  <Alert severity="error">{formErrors.general}</Alert>
                )}

                <TextField
                  label="Номер карты"
                  value={formData.card_number}
                  onChange={handleCardNumberChange}
                  error={!!formErrors.card_number}
                  helperText={formErrors.card_number}
                  placeholder="1234 5678 9012 3456"
                  fullWidth
                  inputProps={{ maxLength: 19 }}
                />

                <TextField
                  label="Имя держателя карты"
                  value={formData.cardholder_name}
                  onChange={(e) => {
                    setFormData({ ...formData, cardholder_name: e.target.value });
                    if (formErrors.cardholder_name) {
                      setFormErrors({ ...formErrors, cardholder_name: '' });
                    }
                  }}
                  error={!!formErrors.cardholder_name}
                  helperText={formErrors.cardholder_name}
                  fullWidth
                />

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Месяц"
                    value={formData.expiry_month}
                    onChange={(e) => {
                      setFormData({ ...formData, expiry_month: e.target.value });
                      if (formErrors.expiry_month) {
                        setFormErrors({ ...formErrors, expiry_month: '' });
                      }
                    }}
                    error={!!formErrors.expiry_month}
                    helperText={formErrors.expiry_month}
                    type="number"
                    inputProps={{ min: 1, max: 12 }}
                    sx={{ width: '30%' }}
                  />
                  <TextField
                    label="Год"
                    value={formData.expiry_year}
                    onChange={(e) => {
                      setFormData({ ...formData, expiry_year: e.target.value });
                      if (formErrors.expiry_year) {
                        setFormErrors({ ...formErrors, expiry_year: '' });
                      }
                    }}
                    error={!!formErrors.expiry_year}
                    helperText={formErrors.expiry_year}
                    type="number"
                    inputProps={{ min: new Date().getFullYear(), max: new Date().getFullYear() + 20 }}
                    sx={{ width: '30%' }}
                  />
                  <TextField
                    label="CVV"
                    value={formData.cvv}
                    onChange={(e) => {
                      setFormData({ ...formData, cvv: e.target.value });
                      if (formErrors.cvv) {
                        setFormErrors({ ...formErrors, cvv: '' });
                      }
                    }}
                    error={!!formErrors.cvv}
                    helperText={formErrors.cvv}
                    type="password"
                    inputProps={{ maxLength: 4 }}
                    sx={{ width: '40%' }}
                  />
                </Stack>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    />
                  }
                  label="Использовать как карту по умолчанию"
                />
              </Stack>
            ) : (
              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                onClick={() => setShowAddForm(true)}
                fullWidth
              >
                Добавить новую карту
              </Button>
            )}
          </Stack>
        </Scrollbar>
      </DialogContent>

      <DialogActions>
        {showAddForm && (
          <Button onClick={() => setShowAddForm(false)} disabled={creating}>
            Назад
          </Button>
        )}
        <Button onClick={onClose} disabled={creating}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={creating || (!showAddForm && !selectedCardId)}
          startIcon={creating ? <Iconify icon="solar:loading-bold" /> : <Iconify icon="solar:check-circle-bold" />}
        >
          {(() => {
            if (creating) return 'Сохранение...';
            if (showAddForm) return 'Сохранить карту';
            return 'Выбрать';
          })()}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

