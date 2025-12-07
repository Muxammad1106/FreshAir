import { m, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useRef } from 'react';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// components
import { MotionContainer, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

// Floating particles for clean air animation
const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 40 + 20,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 10 + 10,
  delay: Math.random() * 2,
}));

function FloatingParticles({ scrollProgress }: { scrollProgress: any }) {
  const theme = useTheme();
  const opacity = useTransform(scrollProgress, [0, 0.5, 1], [1, 0.5, 0]);
  const scale = useTransform(scrollProgress, [0, 0.5, 1], [1, 0.8, 0.6]);

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
            scale,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
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
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.4)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 50%, transparent 100%)`,
              filter: 'blur(1px)',
            }}
          />
        </m.div>
      ))}
    </Box>
  );
}

function AirFlowAnimation({ scrollProgress }: { scrollProgress: any }) {
  const theme = useTheme();
  const opacity = useTransform(scrollProgress, [0, 0.5, 1], [0.6, 0.3, 0]);
  const scale = useTransform(scrollProgress, [0, 0.5, 1], [1, 1.2, 1.5]);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: 300, md: 500 },
        height: { xs: 300, md: 500 },
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      {[0, 1, 2].map((i) => (
        <m.div
          key={i}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity,
            scale,
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 2,
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2 - i * 0.05)}`,
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        </m.div>
      ))}
    </Box>
  );
}

export default function HomeHero() {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: '80vh', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(180deg, 
          ${alpha(theme.palette.primary.main, 0.05)} 0%, 
          ${alpha(theme.palette.primary.main, 0.1)} 50%,
          ${alpha(theme.palette.success.main, 0.08)} 100%
        )`,
      }}
    >
      <FloatingParticles scrollProgress={scrollYProgress} />
      <AirFlowAnimation scrollProgress={scrollYProgress} />

      <Container
        component={MotionContainer}
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        <m.div
          style={{
            opacity: contentOpacity,
            y: contentY,
          }}
        >
          <Stack spacing={5} alignItems="center" sx={{ textAlign: 'center', py: { xs: 5, md: 10 } }}>
            <m.div variants={varFade().inUp}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                  fontWeight: 700,
                  mb: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Clean Air Subscription
              </Typography>
            </m.div>

            <m.div variants={varFade().inUp}>
              <Typography
                variant="h5"
                sx={{
                  color: 'text.secondary',
                  maxWidth: 600,
                  mb: 5,
                  fontWeight: 400,
                }}
              >
                Get a modern air purifier with a fixed monthly subscription fee
              </Typography>
            </m.div>

            <m.div variants={varFade().inUp}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <Button
                  component={RouterLink}
                  href={`${paths.auth.jwt.register}?role=customer`}
                  size="large"
                  variant="contained"
                  color="primary"
                  sx={{
                    px: 5,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                >
                  Subscribe Now
                </Button>
                <Button
                  component={RouterLink}
                  href={paths.home.investor}
                  size="large"
                  variant="outlined"
                  sx={{
                    px: 5,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                  }}
                >
                  Become Investor
                </Button>
              </Stack>
            </m.div>

            <m.div
              variants={varFade().inUp}
              style={{ position: 'relative', zIndex: 1 }}
            >
              <Box
                sx={{
                  width: { xs: '100%', md: '600px' },
                  height: { xs: 300, md: 400 },
                  position: 'relative',
                  mt: 5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <m.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 200, md: 300 },
                      height: { xs: 200, md: 300 },
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.success.main, 0.1)} 50%, transparent 100%)`,
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '20%',
                        left: '20%',
                        width: '60%',
                        height: '60%',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.3)} 0%, transparent 70%)`,
                        filter: 'blur(20px)',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '30%',
                        left: '30%',
                        width: '40%',
                        height: '40%',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.4)} 0%, transparent 70%)`,
                        filter: 'blur(15px)',
                      },
                    }}
                  />
                </m.div>
              </Box>
            </m.div>
          </Stack>
        </m.div>
      </Container>
    </Box>
  );
}

