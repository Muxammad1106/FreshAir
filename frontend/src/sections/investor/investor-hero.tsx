import { m, useScroll, useTransform, useSpring } from 'framer-motion';
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
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

// Investment growth particles
const investmentParticles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 30 + 20,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 8 + 5,
  delay: Math.random() * 2,
}));

function InvestmentAnimation({ scrollProgress }: { scrollProgress: any }) {
  const theme = useTheme();
  const scale = useTransform(scrollProgress, [0, 0.5, 1], [0.8, 1, 1.2]);
  const rotate = useTransform(scrollProgress, [0, 1], [0, 360]);
  const opacity = useTransform(scrollProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5]);

  return (
    <Box
      sx={{
        width: { xs: '100%', md: '700px' },
        height: { xs: 400, md: 500 },
        position: 'relative',
        mt: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Floating particles */}
      {investmentParticles.map((particle) => (
        <m.div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.2, 1],
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
              background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.4)} 0%, transparent 70%)`,
              filter: 'blur(1px)',
            }}
          />
        </m.div>
      ))}

      {/* Main investment circle */}
      <m.div
        style={{
          scale,
          rotate,
          opacity,
        }}
      >
        <Box
          sx={{
            width: { xs: 250, md: 350 },
            height: { xs: 250, md: 350 },
            borderRadius: '50%',
            position: 'relative',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.success.main, 0.1)} 50%, transparent 100%)`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '15%',
              left: '15%',
              width: '70%',
              height: '70%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.3)} 0%, transparent 70%)`,
              filter: 'blur(25px)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '25%',
              left: '25%',
              width: '50%',
              height: '50%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.4)} 0%, transparent 70%)`,
              filter: 'blur(20px)',
            },
          }}
        />
      </m.div>

      {/* Money icons floating */}
      {[0, 1, 2, 3].map((i) => (
        <m.div
          key={`money-${i}`}
          style={{
            position: 'absolute',
            opacity,
          }}
          animate={{
            y: [0, -60, 0],
            x: [0, Math.sin(i) * 30, 0],
            rotate: [0, 360],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + i,
            delay: i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Iconify
            icon="solar:dollar-bold"
            sx={{
              width: { xs: 40, md: 60 },
              height: { xs: 40, md: 60 },
              color: 'success.main',
              filter: 'drop-shadow(0 0 10px rgba(76, 175, 80, 0.5))',
            }}
          />
        </m.div>
      ))}

      {/* Growth chart lines */}
      {[0, 1, 2].map((i) => (
        <m.div
          key={`line-${i}`}
          style={{
            position: 'absolute',
            width: '100%',
            height: '2px',
            opacity,
          }}
          animate={{
            scaleX: [0, 1, 0],
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, -50 + i * 30, 0],
          }}
          transition={{
            duration: 4 + i,
            delay: i * 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.success.main, 0.6)}, transparent)`,
              transform: `rotate(${i * 15}deg)`,
            }}
          />
        </m.div>
      ))}

      {/* Percentage indicators */}
      <m.div
        style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          opacity,
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: 'success.main',
            textShadow: `0 0 20px ${alpha(theme.palette.success.main, 0.5)}`,
          }}
        >
          +25%
        </Typography>
      </m.div>

      <m.div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          opacity,
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            textShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`,
          }}
        >
          $125
        </Typography>
      </m.div>
    </Box>
  );
}

export default function InvestorHero() {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const contentOpacity = useSpring(
    useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 1, 0.8, 0]),
    springConfig
  );
  const contentY = useSpring(
    useTransform(scrollYProgress, [0, 0.5, 1], [0, 50, 100]),
    springConfig
  );

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
          ${alpha(theme.palette.primary.main, 0.08)} 0%, 
          ${alpha(theme.palette.success.main, 0.05)} 50%,
          ${alpha(theme.palette.primary.main, 0.08)} 100%
        )`,
      }}
    >
      <Container component={MotionContainer}>
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
                Invest in Clean Air
              </Typography>
            </m.div>

            <m.div variants={varFade().inUp}>
              <Typography
                variant="h5"
                sx={{
                  color: 'text.secondary',
                  maxWidth: 700,
                  mb: 5,
                  fontWeight: 400,
                }}
              >
                Buy an air purifier — we rent it out and pay you passive income every month
              </Typography>
            </m.div>

            <m.div variants={varFade().inUp}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <Button
                  component={RouterLink}
                  href={`${paths.auth.jwt.register}?role=investor`}
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
                  Become Investor
                </Button>
                <Button
                  component={RouterLink}
                  href={paths.home.root}
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
                  Become Customer
                </Button>
              </Stack>
            </m.div>

            <m.div variants={varFade().inUp} style={{ position: 'relative', zIndex: 1 }}>
              <InvestmentAnimation scrollProgress={scrollYProgress} />
            </m.div>
          </Stack>
        </m.div>
      </Container>
    </Box>
  );
}

