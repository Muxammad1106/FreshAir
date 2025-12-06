import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
// components
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
// hooks
import { useGet } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';
// types
import { Investment, InvestorDashboard, PaginatedResponse } from './investments/types';
// components
import { InvestmentCard } from './investments/investment-card';
import { InvestmentListSkeleton } from './investments/investment-list-skeleton';
import { CreateInvestmentModal } from './investments/create-investment-modal';
import { InvestmentModal } from './investments/investment-modal';

// ----------------------------------------------------------------------

export default function InvestorPage() {
  const settings = useSettingsContext();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  // Загружаем дашборд
  const { data: dashboard, loading: dashboardLoading } = useGet<InvestorDashboard>(
    API_ENDPOINTS.core.investor.dashboard
  );

  // Загружаем инвестиции
  const { data: investments, loading: investmentsLoading, error: investmentsError, execute } = useGet<
    Investment[],
    any
  >(API_ENDPOINTS.core.investor.investments, {
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
  });

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    execute(); // Обновляем список после создания
  };

  const handleInvestmentClick = (investment: Investment) => {
    setSelectedInvestment(investment);
  };

  const handleCloseInvestmentModal = () => {
    setSelectedInvestment(null);
    execute(); // Обновляем список после оплаты
  };

  const loading = dashboardLoading || investmentsLoading;

  return (
    <>
      <Helmet>
        <title> Портфолио | Air Purifier</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Портфолио</Typography>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Обновить">
                <IconButton onClick={() => execute()} disabled={loading}>
                  <Iconify icon="solar:refresh-bold" />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                onClick={() => setCreateModalOpen(true)}
              >
                Добавить инвестицию
              </Button>
            </Stack>
          </Stack>

          {/* Summary Cards */}
          {dashboard && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="solar:dollar-bold" width={24} sx={{ color: 'primary.main' }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Всего вложено
                        </Typography>
                      </Stack>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        ${parseFloat(dashboard.total_invested_usd).toFixed(2)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="solar:devices-bold" width={24} sx={{ color: 'success.main' }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Активных устройств
                        </Typography>
                      </Stack>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {dashboard.active_devices_count}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="solar:wind-bold" width={24} sx={{ color: 'info.main' }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Очищено воздуха
                        </Typography>
                      </Stack>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {dashboard.total_cleaned_air_m3.toFixed(0)} м³
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="solar:graph-up-bold" width={24} sx={{ color: 'warning.main' }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Прогнозируемый доход
                        </Typography>
                      </Stack>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                        ${parseFloat(dashboard.projected_return_total_usd).toFixed(2)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Investments List */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6">Мои инвестиции</Typography>
                {!loading && investments && investments.length > 0 && (
                  <Chip label={investments.length} size="small" color="primary" />
                )}
              </Stack>
            </Stack>

            {(() => {
              if (loading) {
                return <InvestmentListSkeleton />;
              }
              if (investmentsError) {
                return <Alert severity="error">Ошибка при загрузке инвестиций. Попробуйте обновить страницу.</Alert>;
              }
              if (!investments || investments.length === 0) {
                return (
                  <Alert severity="info">
                    У вас пока нет инвестиций. Создайте первую инвестицию, чтобы начать зарабатывать.
                  </Alert>
                );
              }
              return (
                <Grid container spacing={3}>
                  {investments.map((investment) => (
                    <Grid item xs={12} sm={6} md={4} key={investment.id}>
                      <InvestmentCard investment={investment} onClick={() => handleInvestmentClick(investment)} />
                    </Grid>
                  ))}
                </Grid>
              );
            })()}
          </Box>
        </Stack>
      </Container>

      <CreateInvestmentModal open={createModalOpen} onClose={handleCloseCreateModal} />
      {selectedInvestment && (
        <InvestmentModal
          key={selectedInvestment.id}
          open={!!selectedInvestment}
          investment={selectedInvestment}
          onClose={handleCloseInvestmentModal}
        />
      )}
    </>
  );
}
