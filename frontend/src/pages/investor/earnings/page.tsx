import { Helmet } from 'react-helmet-async';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// components
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

export default function InvestorEarningsPage() {
  const settings = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Earnings | Air Purifier</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Earnings
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Earnings page coming soon
        </Typography>
      </Container>
    </>
  );
}

