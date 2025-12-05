import { m } from 'framer-motion';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// components
import Iconify from 'src/components/iconify';
import { MotionContainer, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

const PLANS = [
  {
    name: 'Basic',
    price: '29',
    features: ['Очиститель воздуха', 'Базовый мониторинг', 'Замена фильтров раз в 6 месяцев'],
    popular: false,
  },
  {
    name: 'Standard',
    price: '49',
    features: [
      'Очиститель воздуха премиум',
      'Расширенный мониторинг',
      'Замена фильтров раз в 3 месяца',
      'Приоритетная поддержка',
    ],
    popular: true,
  },
  {
    name: 'Premium',
    price: '79',
    features: [
      'Очиститель воздуха премиум+',
      'Smart мониторинг в реальном времени',
      'Замена фильтров раз в месяц',
      '24/7 поддержка',
      'Персональный менеджер',
    ],
    popular: false,
  },
];

// ----------------------------------------------------------------------

export default function HomePricing() {
  return (
    <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'background.default' }}>
      <Container component={MotionContainer}>
        <Stack spacing={5} alignItems="center">
          <m.div variants={varFade().inUp}>
            <Typography variant="h2" sx={{ textAlign: 'center', mb: 2 }}>
              Тарифы
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
              Выберите подходящий план подписки
            </Typography>
          </m.div>

          <Grid container spacing={3} sx={{ mt: 3 }}>
            {PLANS.map((plan) => (
              <Grid item xs={12} md={4} key={plan.name}>
                <m.div variants={varFade().inUp}>
                  <Card
                    sx={{
                      height: '100%',
                      position: 'relative',
                      ...(plan.popular && {
                        border: (theme) => `2px solid ${theme.palette.primary.main}`,
                        boxShadow: (theme) => theme.customShadows.z24,
                      }),
                    }}
                  >
                    {plan.popular && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                        }}
                      >
                        <Typography variant="caption" fontWeight={600}>
                          Популярный
                        </Typography>
                      </Box>
                    )}

                    <CardContent sx={{ p: 4 }}>
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="h4" sx={{ mb: 1 }}>
                            {plan.name}
                          </Typography>
                          <Stack direction="row" alignItems="baseline" spacing={0.5}>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                              ${plan.price}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              /месяц
                            </Typography>
                          </Stack>
                        </Box>

                        <List>
                          {plan.features.map((feature) => (
                            <ListItem key={feature} disableGutters>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Iconify
                                  icon="solar:check-circle-bold"
                                  sx={{ color: 'primary.main' }}
                                />
                              </ListItemIcon>
                              <ListItemText primary={feature} />
                            </ListItem>
                          ))}
                        </List>

                        <Button
                          fullWidth
                          variant={plan.popular ? 'contained' : 'outlined'}
                          size="large"
                          sx={{ mt: 2 }}
                        >
                          Subscribe
                        </Button>
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

