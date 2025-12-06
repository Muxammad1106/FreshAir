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

const STEPS = [
  {
    title: 'Invest in Devices',
    description: 'Purchase air purification devices starting from $300. Choose from available devices in our marketplace.',
    icon: 'solar:cart-bold',
  },
  {
    title: 'We Install & Manage',
    description: 'We find subscribers, install devices at their locations, and handle all customer relationships.',
    icon: 'solar:home-smile-bold',
  },
  {
    title: 'Receive Monthly Returns',
    description: 'Earn passive income every month. Typical returns range from $12-18 per device based on usage.',
    icon: 'solar:wallet-money-bold',
  },
  {
    title: 'Fully Passive Investment',
    description: 'Zero management required. We handle everything - you just collect your returns monthly.',
    icon: 'solar:chart-2-bold',
  },
];

// ----------------------------------------------------------------------

export default function InvestorHowItWorks() {
  return (
    <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'background.default' }}>
      <Container component={MotionContainer}>
        <Stack spacing={5} alignItems="center">
          <m.div variants={varFade().inUp}>
            <Typography variant="h2" sx={{ textAlign: 'center', mb: 2 }}>
              How It Works
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
              A simple, transparent investment process with passive returns
            </Typography>
          </m.div>

          <Grid container spacing={3}>
            {STEPS.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={step.title}>
                <m.div variants={varFade().inUp}>
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      p: 3,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: (theme) => theme.customShadows.z24,
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          bgcolor: (theme) => theme.palette.primary.lighter,
                        }}
                      >
                        <Iconify
                          icon={step.icon}
                          width={48}
                          sx={{ color: 'primary.main' }}
                        />
                      </Box>

                      <Typography variant="h5" sx={{ mb: 1.5 }}>
                        {index + 1}. {step.title}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
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

