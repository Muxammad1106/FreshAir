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
    title: 'Buy a Device',
    description: 'Purchase an air purifier starting from $100 (min investment) up to $1000 (max investment)',
    icon: 'solar:cart-bold',
  },
  {
    title: 'We Install at Subscriber',
    description: 'We find a subscriber and install the device at their location',
    icon: 'solar:home-smile-bold',
  },
  {
    title: 'Receive Monthly Income',
    description: 'Every month you receive passive income based on 25% profit over 6 months',
    icon: 'solar:wallet-money-bold',
  },
  {
    title: 'Fully Passive Process',
    description: 'We manage everything, you don\'t need to do anything',
    icon: 'solar:chart-2-bold',
  },
];

// ----------------------------------------------------------------------

export default function InvestorHowItWorks() {
  return (
    <Box id="how-it-works" sx={{ py: { xs: 10, md: 15 }, bgcolor: 'background.default' }}>
      <Container component={MotionContainer}>
        <Stack spacing={5} alignItems="center">
          <m.div variants={varFade().inUp}>
            <Typography variant="h2" sx={{ textAlign: 'center', mb: 2 }}>
              How It Works
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

