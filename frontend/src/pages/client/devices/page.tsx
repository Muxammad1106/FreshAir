import { Helmet } from 'react-helmet-async';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// components
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

export default function ClientDevicesPage() {
  const settings = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Devices | Air Purifier</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Devices
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Devices page coming soon
        </Typography>
      </Container>
    </>
  );
}

