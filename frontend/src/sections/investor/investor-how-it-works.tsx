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
    title: 'Покупаете устройство',
    description: 'Вы приобретаете очиститель воздуха по цене $300',
    icon: 'solar:cart-bold',
  },
  {
    title: 'Мы ставим его у подписчика',
    description: 'Мы находим подписчика и устанавливаем устройство у него',
    icon: 'solar:home-smile-bold',
  },
  {
    title: 'Вы получаете ежемесячный доход',
    description: 'Каждый месяц вы получаете $12-18 пассивного дохода',
    icon: 'solar:wallet-money-bold',
  },
  {
    title: 'Полностью пассивный процесс',
    description: 'Мы управляем всем процессом, вам не нужно ничего делать',
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
              Как это работает
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

