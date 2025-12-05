import { Helmet } from 'react-helmet-async';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
// components
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

export default function ClientPage() {
  const settings = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Client Dashboard | Air Purifier</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Client Dashboard
        </Typography>

        <Box
          sx={{
            mt: 5,
            width: 1,
            height: 320,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            border: (theme) => `dashed 1px ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Dashboard coming soon
          </Typography>
        </Box>
      </Container>
    </>
  );
}

