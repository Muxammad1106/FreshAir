import { m, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
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
import Chip from '@mui/material/Chip';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// components
import Iconify from 'src/components/iconify';
import { MotionContainer, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

const PLANS = [
  {
    name: 'Basic',
    price: '53.20',
    roomType: 'Home',
    maxArea: 'Up to 100 m²',
    maxVolume: 'Up to 135 m³',
    deviceType: 'Purifier X45 Medium',
    subscriptionType: 'Air Cleaning',
    bonus: null,
    features: [
      'Air Cleaning Subscription',
      'Air Purifier Device (45 m² / 135 m³)',
      'Real-time Air Quality Monitoring',
      'Filter Replacement Every 6 Months',
      'Standard Support',
      'Mobile App Access',
      'Energy Efficient (30W)',
    ],
    popular: false,
  },
  {
    name: 'Standard',
    price: '90.00',
    roomType: 'Commercial',
    maxArea: 'Up to 200 m²',
    maxVolume: 'Up to 600 m³',
    deviceType: 'Combo Pro 200',
    subscriptionType: 'Air Cleaning',
    bonus: 'Humidifying + Aroma (Free)',
    features: [
      'Air Cleaning Subscription',
      'Premium Combo Device (200 m² / 600 m³)',
      'Advanced Real-time Monitoring',
      'Filter Replacement Every 3 Months',
      'Priority Support 24/7',
      'Maintenance Included',
      'Mobile App + Dashboard',
      'High Performance (80W)',
    ],
    popular: true,
  },
];

// ----------------------------------------------------------------------

// Floating particles background
const particles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  size: Math.random() * 60 + 40,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 15 + 10,
  delay: Math.random() * 3,
}));

function FloatingParticles({ scrollProgress }: { scrollProgress: any }) {
  const theme = useTheme();
  const opacity = useTransform(scrollProgress, [0, 0.5, 1], [0.3, 0.6, 0.2]);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {particles.map((particle) => (
        <m.div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 30 - 15, 0],
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Box
            sx={{
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
              filter: 'blur(2px)',
            }}
          />
        </m.div>
      ))}
    </Box>
  );
}

export default function HomePricing() {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]), springConfig);
  const y = useSpring(useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]), springConfig);
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]), springConfig);
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]), springConfig);

  return (
    <Box
      ref={containerRef}
      id="pricing"
      sx={{
        position: 'relative',
        py: { xs: 10, md: 15 },
        background: `linear-gradient(180deg, 
          ${alpha(theme.palette.background.default, 1)} 0%, 
          ${alpha(theme.palette.primary.main, 0.04)} 50%,
          ${alpha(theme.palette.success.main, 0.02)} 100%
        )`,
        overflow: 'hidden',
      }}
    >
      <FloatingParticles scrollProgress={scrollYProgress} />
      
      <Container component={MotionContainer} sx={{ position: 'relative', zIndex: 1 }}>
        <m.div
          style={{
            opacity,
            y,
            scale,
            rotateX,
            transformStyle: 'preserve-3d',
          }}
        >
          <Stack spacing={5} alignItems="center">
            <m.div
              variants={varFade().inUp}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Typography
                variant="h2"
                sx={{
                  textAlign: 'center',
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Pricing Plans
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 600 }}>
                Subscribe to air cleaning service. Get humidifying and aroma as a bonus!
              </Typography>
            </m.div>

            <Grid container spacing={4} sx={{ mt: 3 }}>
              {PLANS.map((plan, index) => (
                <Grid item xs={12} md={6} key={plan.name}>
                  <m.div
                    initial={{ opacity: 0, y: 100, rotateY: -20 }}
                    whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      delay: index * 0.3,
                      type: 'spring',
                      stiffness: 100,
                      damping: 15,
                    }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    style={{ perspective: 1000 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        position: 'relative',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        transformStyle: 'preserve-3d',
                        ...(plan.popular && {
                          border: (t) => `2px solid ${t.palette.primary.main}`,
                          boxShadow: (t) => `0 20px 60px ${alpha(t.palette.primary.main, 0.3)}`,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 100%)`,
                            borderRadius: 'inherit',
                            opacity: 0,
                            transition: 'opacity 0.3s',
                          },
                          '&:hover::before': {
                            opacity: 1,
                          },
                        }),
                      }}
                    >
                      {plan.popular && (
                        <m.div
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          <Chip
                            label="Popular"
                            color="primary"
                            sx={{
                              position: 'absolute',
                              top: 16,
                              right: 16,
                              fontWeight: 600,
                              zIndex: 2,
                              boxShadow: theme.customShadows.z8,
                            }}
                          />
                        </m.div>
                      )}

                      {plan.bonus && (
                        <m.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.3 + 0.2 }}
                        >
                          <Chip
                            label={plan.bonus}
                            color="success"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 16,
                              left: 16,
                              fontWeight: 600,
                              zIndex: 2,
                              bgcolor: 'success.main',
                              color: 'success.contrastText',
                              boxShadow: theme.customShadows.z8,
                            }}
                            icon={<Iconify icon="solar:gift-bold" width={16} />}
                          />
                        </m.div>
                      )}

                      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                        <Stack spacing={3}>
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                {plan.name}
                              </Typography>
                              <Chip
                                label={plan.roomType}
                                size="small"
                                color="default"
                                sx={{ height: 24 }}
                              />
                            </Stack>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'primary.main',
                                fontWeight: 600,
                                mb: 1,
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                              }}
                            >
                              {plan.subscriptionType} Subscription
                            </Typography>
                            <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mb: 1 }}>
                              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                ${plan.price}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                /month
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                {plan.maxArea}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                                •
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {plan.maxVolume}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                                •
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {plan.deviceType}
                              </Typography>
                            </Stack>
                          </Box>

                          <List sx={{ py: 0 }}>
                            {plan.features.map((feature, idx) => (
                              <m.div
                                key={feature}
                                initial={{ opacity: 0, x: -30, rotateX: -90 }}
                                whileInView={{ opacity: 1, x: 0, rotateX: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                  delay: index * 0.3 + idx * 0.1,
                                  type: 'spring',
                                  stiffness: 100,
                                }}
                              >
                                <ListItem disableGutters sx={{ py: 0.5 }}>
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <m.div
                                      animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 360],
                                      }}
                                      transition={{
                                        duration: 0.5,
                                        delay: index * 0.3 + idx * 0.1,
                                      }}
                                    >
                                      <Iconify
                                        icon="solar:check-circle-bold"
                                        sx={{ color: 'success.main', width: 24, height: 24 }}
                                      />
                                    </m.div>
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={feature}
                                    primaryTypographyProps={{
                                      variant: 'body2',
                                    }}
                                  />
                                </ListItem>
                              </m.div>
                            ))}
                          </List>

                          <m.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              component={RouterLink}
                              href={`${paths.auth.jwt.register}?role=customer`}
                              fullWidth
                              variant={plan.popular ? 'contained' : 'outlined'}
                              size="large"
                              sx={{
                                mt: 2,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                position: 'relative',
                                overflow: 'hidden',
                                ...(plan.popular && {
                                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                    transition: 'left 0.5s',
                                  },
                                  '&:hover::before': {
                                    left: '100%',
                                  },
                                }),
                              }}
                            >
                              Subscribe Now
                            </Button>
                          </m.div>
                        </Stack>
                      </CardContent>
                    </Card>
                  </m.div>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </m.div>
      </Container>
    </Box>
  );
}

