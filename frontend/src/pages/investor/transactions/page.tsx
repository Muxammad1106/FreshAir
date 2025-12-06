import { Helmet } from 'react-helmet-async';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
// components
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
// hooks
import { useGet } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';
import { fDate } from 'src/utils/format-time';
// types
import { Investment, PaginatedResponse } from '../investments/types';

// ----------------------------------------------------------------------

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  PENDING: 'warning',
  PAID: 'success',
  FAILED: 'error',
  CANCELLED: 'default',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидает оплаты',
  PAID: 'Оплачено',
  FAILED: 'Ошибка',
  CANCELLED: 'Отменено',
};

export default function InvestorTransactionsPage() {
  const settings = useSettingsContext();

  const { data: investments, loading, error } = useGet<Investment[], any>(
    API_ENDPOINTS.core.investor.investments,
    {
      transformResponse: (response) => {
        const { data } = response;
        if (Array.isArray(data)) {
          return data;
        }
        if (data && typeof data === 'object' && 'results' in data) {
          return (data as PaginatedResponse<Investment>).results || [];
        }
        return [];
      },
    }
  );

  return (
    <>
      <Helmet>
        <title> Транзакции | Air Purifier</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack spacing={3}>
          <Typography variant="h4">История транзакций</Typography>

          {loading && (
            <Typography variant="body2" color="text.secondary">
              Загрузка транзакций...
            </Typography>
          )}

          {error && (
            <Card>
              <CardContent>
                <Typography variant="body1" color="error">
                  Ошибка при загрузке транзакций. Попробуйте обновить страницу.
                </Typography>
              </CardContent>
            </Card>
          )}

          {!loading && !error && (!investments || investments.length === 0) && (
            <Card>
              <CardContent>
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 5 }}>
                  Нет транзакций
                </Typography>
              </CardContent>
            </Card>
          )}

          {!loading && !error && investments && investments.length > 0 && (
            <Stack spacing={2}>
              {investments.map((investment) => (
                <Card key={investment.id}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6">Транзакция #{investment.id}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {fDate(investment.created_at)}
                          </Typography>
                        </Box>
                        <Chip
                          label={STATUS_LABELS[investment.status] || investment.status}
                          color={STATUS_COLORS[investment.status] || 'default'}
                          size="small"
                        />
                      </Stack>

                      <Stack direction="row" spacing={2} divider={<Box sx={{ borderLeft: 1, borderColor: 'divider', height: 20, alignSelf: 'center' }} />}>
                        <Box>
                          <Typography variant="caption" color="text.disabled">
                            Сумма
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            ${parseFloat(investment.amount_usd).toFixed(2)}
                          </Typography>
                        </Box>
                        {investment.device && (
                          <Box>
                            <Typography variant="caption" color="text.disabled">
                              Устройство
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {investment.device.device_type.name}
                            </Typography>
                          </Box>
                        )}
                        {investment.paid_at && (
                          <Box>
                            <Typography variant="caption" color="text.disabled">
                              Дата оплаты
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {fDate(investment.paid_at)}
                            </Typography>
                          </Box>
                        )}
                      </Stack>

                      {investment.projected_return_usd && (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: 'success.lighter',
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Iconify icon="solar:graph-up-bold" width={20} sx={{ color: 'success.main' }} />
                            <Typography variant="body2" color="success.darker">
                              Прогнозируемый доход: <strong>${parseFloat(investment.projected_return_usd).toFixed(2)}</strong>
                              {investment.projected_return_date && ` до ${fDate(investment.projected_return_date)}`}
                            </Typography>
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </>
  );
}

