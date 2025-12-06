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
              Income Model
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
              Transparent returns with predictable monthly income
            </Typography>
          </m.div>

          <Grid container spacing={4} sx={{ mt: 3 }}>
            <Grid item xs={12} md={6}>
              <m.div variants={varFade().inUp}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                      <Typography variant="h4" sx={{ mb: 2 }}>
                        Investment Example
                      </Typography>

                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" color="text.secondary">
                            Device Investment:
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            $300
                          </Typography>
                        </Stack>

                        <Divider />

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" color="text.secondary">
                            Monthly Income:
                          </Typography>
                          <Typography variant="h6" fontWeight={700} color="primary.main">
                            $12–18
                          </Typography>
                        </Stack>

                        <Divider />

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" color="text.secondary">
                            Payback Period:
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            ~18–24 months
                          </Typography>
                        </Stack>

                        <Divider />

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" color="text.secondary">
                            Annual ROI:
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
                        Returns Timeline
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
                          Returns Chart (placeholder)
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        * Returns may vary based on subscriber plan and device usage. 
                        All figures are estimates based on typical performance.
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

