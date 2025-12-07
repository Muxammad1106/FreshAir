import { m } from 'framer-motion';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
// components
import Iconify from 'src/components/iconify';
import { MotionContainer, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

const RISKS = [
  {
    title: 'Maintenance Guarantee',
    description:
      'We are fully responsible for device maintenance. In case of breakdown, we repair or replace the device free of charge.',
    icon: 'solar:shield-check-bold',
  },
  {
    title: 'Full Monitoring',
    description:
      'You get access to a dashboard where you can see the status of your devices, returns, and all transactions in real-time.',
    icon: 'solar:graph-up-bold',
  },
  {
    title: 'Conservative Risks',
    description:
      'We work only with verified subscribers, use insurance, and guarantee minimal risk level.',
    icon: 'solar:verified-check-bold',
  },
];

// ----------------------------------------------------------------------

export default function InvestorRisk() {
  return (
    <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'background.default' }}>
      <Container component={MotionContainer}>
        <Stack spacing={5} alignItems="center">
          <m.div variants={varFade().inUp}>
            <Typography variant="h2" sx={{ textAlign: 'center', mb: 2 }}>
              Risks & Transparency
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
              We ensure maximum protection for your investments
            </Typography>
          </m.div>

          <Grid container spacing={3}>
            {RISKS.map((risk) => (
              <Grid item xs={12} md={4} key={risk.title}>
                <m.div variants={varFade().inUp}>
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: (theme) => theme.customShadows.z24,
                      },
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            bgcolor: (theme) => theme.palette.primary.lighter,
                          }}
                        >
                          <Iconify
                            icon={risk.icon}
                            width={32}
                            sx={{ color: 'primary.main' }}
                          />
                        </Box>

                        <Typography variant="h5">{risk.title}</Typography>

                        <Typography variant="body2" color="text.secondary">
                          {risk.description}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </m.div>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

