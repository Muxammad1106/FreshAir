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
    period: 'per month',
    description: 'Perfect for small spaces',
    features: [
      'Air Purifier Device',
      'Basic Air Quality Monitoring',
      'Filter Replacement Every 6 Months',
      'Email Support',
    ],
    popular: false,
  },
  {
    name: 'Standard',
    price: '49',
    period: 'per month',
    description: 'Most popular choice',
    features: [
      'Premium Air Purifier',
      'Advanced Real-time Monitoring',
      'Filter Replacement Every 3 Months',
      'Priority Support',
      'Humidification Features',
    ],
    popular: true,
  },
  {
    name: 'Premium',
    price: '79',
    period: 'per month',
    description: 'Complete air care solution',
    features: [
      'Premium+ Air Purifier',
      'Smart Real-time Monitoring',
      'Filter Replacement Every Month',
      '24/7 Dedicated Support',
      'Personal Account Manager',
      'Aromatherapy Features',
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
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
              Choose the plan that fits your needs. All plans include free delivery, installation, and maintenance.
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
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {plan.description}
                          </Typography>
                          <Stack direction="row" alignItems="baseline" spacing={0.5}>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                              ${plan.price}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              /{plan.period}
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
                          Get Started
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

