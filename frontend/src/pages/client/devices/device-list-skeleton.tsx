import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

// ----------------------------------------------------------------------

export function DeviceListSkeleton() {
  return (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="rectangular" height={120} />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="40%" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

