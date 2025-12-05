import { m } from 'framer-motion';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
// components
import { MotionContainer, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

export default function InvestorIncomeModel() {
  return (
    <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'background.neutral' }}>
      <Container component={MotionContainer}>
        <Stack spacing={5} alignItems="center">
          <m.div variants={varFade().inUp}>
            <Typography variant="h2" sx={{ textAlign: 'center', mb: 2 }}>
              Модель дохода
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
              Пример расчета доходности инвестиции
            </Typography>
          </m.div>

          <Grid container spacing={4} sx={{ mt: 3 }}>
            <Grid item xs={12} md={6}>
              <m.div variants={varFade().inUp}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                      <Typography variant="h4" sx={{ mb: 2 }}>
                        Пример инвестиции
                      </Typography>

                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" color="text.secondary">
                            Стоимость устройства:
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            $300
                          </Typography>
                        </Stack>

                        <Divider />

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" color="text.secondary">
                            Доход в месяц:
                          </Typography>
                          <Typography variant="h6" fontWeight={700} color="primary.main">
                            $12–18
                          </Typography>
                        </Stack>

                        <Divider />

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" color="text.secondary">
                            Окупаемость:
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            ~18–24 месяцев
                          </Typography>
                        </Stack>

                        <Divider />

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" color="text.secondary">
                            Годовая доходность:
                          </Typography>
                          <Typography variant="h6" fontWeight={700} color="success.main">
                            ~48–72%
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </m.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <m.div variants={varFade().inUp}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                      <Typography variant="h4" sx={{ mb: 2 }}>
                        График доходности
                      </Typography>

                      <Box
                        sx={{
                          height: 300,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 2,
                          bgcolor: 'background.neutral',
                          border: (theme) => `dashed 1px ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          График доходности (placeholder)
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        * Доходность может варьироваться в зависимости от тарифа подписчика и
                        условий договора
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </m.div>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

