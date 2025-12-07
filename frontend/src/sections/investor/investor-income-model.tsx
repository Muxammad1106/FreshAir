import { m, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
// components
import { MotionContainer, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

// Example: $500 investment, 25% return over 6 months = $125 profit
const CHART_DATA = [
  { month: 'Month 1', invested: 500, return: 500 },
  { month: 'Month 2', invested: 500, return: 520 },
  { month: 'Month 3', invested: 500, return: 540 },
  { month: 'Month 4', invested: 500, return: 560 },
  { month: 'Month 5', invested: 500, return: 580 },
  { month: 'Month 6', invested: 500, return: 625 }, // $500 + $125 profit
];

function ReturnChart() {
  const minValue = 500; // Initial investment
  const maxValue = 625; // Final return
  const range = maxValue - minValue;
  const theme = useTheme();

  return (
    <Stack spacing={4} sx={{ height: '100%', justifyContent: 'center', py: 4 }}>
      {CHART_DATA.map((point, index) => {
        // Calculate progress from initial (500) to final (625)
        const progress = range > 0 ? ((point.return - minValue) / range) * 100 : 0;
        const profit = point.return - point.invested;
        const isLast = index === CHART_DATA.length - 1;

        return (
          <m.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Stack direction="row" spacing={4} alignItems="center" sx={{ width: '100%' }}>
              <Box sx={{ minWidth: 120 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: isLast ? 'success.main' : 'text.primary',
                    fontSize: { xs: '0.9rem', md: '1.1rem' },
                  }}
                >
                  {point.month}
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1, position: 'relative' }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1.5 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 500,
                      color: 'text.secondary',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    }}
                  >
                    ${point.invested.toLocaleString()} → ${point.return.toFixed(0).toLocaleString()}
                  </Typography>
                  {profit > 0 && (
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: 'success.main',
                        fontSize: { xs: '1rem', md: '1.25rem' },
                      }}
                    >
                      +${profit.toFixed(0)}
                    </Typography>
                  )}
                </Stack>
                <Box
                  sx={{
                    height: { xs: 32, md: 40 },
                    bgcolor: isLast
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 2,
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: isLast ? theme.customShadows.z8 : 'none',
                  }}
                >
                  <m.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(progress, 0)}%` }}
                    transition={{ duration: 0.8, delay: index * 0.15, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      background: isLast
                        ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
                        : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: 16,
                    }}
                  >
                    {isLast && (
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'success.contrastText',
                          fontSize: { xs: '0.75rem', md: '0.9rem' },
                          fontWeight: 700,
                        }}
                      >
                        +25%
                      </Typography>
                    )}
                  </m.div>
                </Box>
                {isLast && (
                  <Typography
                    variant="h5"
                    sx={{
                      display: 'block',
                      mt: 1.5,
                      fontWeight: 700,
                      color: 'success.main',
                      fontSize: { xs: '1.1rem', md: '1.5rem' },
                    }}
                  >
                    Total Profit: +$125
                  </Typography>
                )}
              </Box>
            </Stack>
          </m.div>
        );
      })}
    </Stack>
  );
}

// ----------------------------------------------------------------------

export default function InvestorIncomeModel() {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Transform scroll progress to opacity and y position (sunset effect)
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.3, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.95, 0.8]);

  return (
    <Box
      id="income-model"
      ref={containerRef}
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: `linear-gradient(180deg, 
          ${alpha(theme.palette.primary.main, 0.05)} 0%, 
          ${alpha(theme.palette.primary.main, 0.1)} 50%,
          ${alpha(theme.palette.success.main, 0.15)} 100%
        )`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at top, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container
        component={MotionContainer}
        sx={{
          position: 'relative',
          zIndex: 1,
          py: { xs: 10, md: 15 },
        }}
      >
        <m.div
          style={{
            opacity,
            y,
            scale,
          }}
        >
          <Stack spacing={6} alignItems="center">
            <m.div variants={varFade().inUp}>
              <Typography
                variant="h1"
                sx={{
                  textAlign: 'center',
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Income Model
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  textAlign: 'center',
                  fontWeight: 400,
                  maxWidth: 600,
                  mx: 'auto',
                }}
              >
                Watch your investment grow month by month
              </Typography>
            </m.div>

            <Box
              sx={{
                width: '100%',
                maxWidth: 1000,
                mx: 'auto',
                p: { xs: 3, md: 6 },
                borderRadius: 4,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(20px)',
                boxShadow: theme.customShadows.z24,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Stack spacing={4}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={3}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Investment Amount
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      $100 - $1,000
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Profit Percentage
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      25%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Investment Period
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      6 months
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Example Return (on $500)
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      $125 profit
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    minHeight: { xs: 400, md: 500 },
                    borderRadius: 3,
                    p: { xs: 3, md: 5 },
                    position: 'relative',
                  }}
                >
                  <ReturnChart />
                </Box>
              </Stack>
            </Box>
          </Stack>
        </m.div>
      </Container>
    </Box>
  );
}

