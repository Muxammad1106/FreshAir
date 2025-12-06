import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
// components
import { InvestmentCard } from './investment-card';
// types
import { Investment } from './types';

// ----------------------------------------------------------------------

interface InvestmentListProps {
  investments: Investment[] | null;
  loading: boolean;
  error: any;
  onInvestmentClick: (investment: Investment) => void;
}

export function InvestmentList({ investments, loading, error, onInvestmentClick }: InvestmentListProps) {
  if (loading) {
    return null;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Ошибка при загрузке инвестиций. Попробуйте обновить страницу.
      </Alert>
    );
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
          <InvestmentCard investment={investment} onClick={() => onInvestmentClick(investment)} />
        </Grid>
      ))}
    </Grid>
  );
}

