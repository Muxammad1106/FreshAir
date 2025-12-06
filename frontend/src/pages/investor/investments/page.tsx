import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
// components
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
// hooks
import { useGet } from 'src/hooks/use-request';
// utils
import { API_ENDPOINTS } from 'src/utils/axios';
// types
import { Investment, PaginatedResponse } from './types';
// components
import { InvestmentList } from './investment-list';
import { InvestmentListSkeleton } from './investment-list-skeleton';
import { CreateInvestmentModal } from './create-investment-modal';
import { InvestmentModal } from './investment-modal';

// ----------------------------------------------------------------------

export default function InvestorInvestmentsPage() {
  const settings = useSettingsContext();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  const { data: investments, loading, error, execute } = useGet<Investment[], any>(
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

  return (
    <>
      <Helmet>
        <title> Инвестиции | Air Purifier</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h4">Мои инвестиции</Typography>
              {!loading && investments && investments.length > 0 && (
                <Chip label={investments.length} size="small" color="primary" />
              )}
            </Stack>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Обновить список">
                <IconButton onClick={() => execute()} disabled={loading}>
                  <Iconify icon="solar:refresh-bold" />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                onClick={() => setCreateModalOpen(true)}
              >
                Новая инвестиция
              </Button>
            </Stack>
          </Stack>

          {loading ? (
            <InvestmentListSkeleton />
          ) : (
            <InvestmentList
              investments={investments}
              loading={loading}
              error={error}
              onInvestmentClick={handleInvestmentClick}
            />
          )}
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

