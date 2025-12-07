import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';

// ----------------------------------------------------------------------

export function InvestmentListSkeleton() {
  return (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack spacing={1}>
                    <Skeleton variant="text" width={150} height={32} />
                    <Skeleton variant="text" width={100} height={20} />
                  </Stack>
                  <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                </Stack>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width={120} height={40} />
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
                <Stack direction="row" spacing={2}>
                  <Skeleton variant="text" width={80} height={40} />
                  <Skeleton variant="text" width={80} height={40} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}


