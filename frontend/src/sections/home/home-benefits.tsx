import { m } from 'framer-motion';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
// components
import Iconify from 'src/components/iconify';
import { MotionContainer, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

const BENEFITS = [
  {
    title: 'Affordable Monthly Plans',
    description: 'No upfront costs. Pay a fixed monthly fee starting from $29.',
    icon: 'solar:wallet-bold',
  },
  {
    title: 'No Upfront Purchase',
    description: 'Skip the expensive one-time purchase. Subscribe and save.',
    icon: 'solar:card-bold',
  },
  {
    title: 'Free Maintenance & Filters',
    description: 'We handle all maintenance, filter replacements, and repairs at no extra cost.',
    icon: 'solar:shield-check-bold',
  },
  {
    title: 'Smart Air Monitoring',
    description: 'Real-time air quality metrics, PM2.5 tracking, and humidity control.',
    icon: 'solar:graph-up-bold',
  },
];

// ----------------------------------------------------------------------

export default function HomeBenefits() {
  return (
    <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'background.neutral' }}>
      <Container component={MotionContainer}>
        <Stack spacing={5}>
          <m.div variants={varFade().inUp}>
            <Typography variant="h2" sx={{ textAlign: 'center', mb: 2 }}>
              Why Choose FreshAir
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
              Everything you need for clean, healthy air without the hassle
            </Typography>
          </m.div>

          <Grid container spacing={3}>
            {BENEFITS.map((benefit) => (
              <Grid item xs={12} sm={6} md={3} key={benefit.title}>
                <m.div variants={varFade().inUp}>
                  <Stack
                    spacing={2}
                    alignItems="center"
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      height: '100%',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme) => theme.customShadows.z8,
                      },
                    }}
                  >
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
                        icon={benefit.icon}
                        width={32}
                        sx={{ color: 'primary.main' }}
                      />
                    </Box>

                    <Typography variant="h6" sx={{ textAlign: 'center' }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                      {benefit.description}
                    </Typography>
                  </Stack>
                </m.div>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

