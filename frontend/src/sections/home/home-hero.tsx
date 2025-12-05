import { m } from 'framer-motion';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
// components
import { MotionContainer, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

export default function HomeHero() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: '80vh', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
      }}
    >
      <Container component={MotionContainer}>
        <Stack spacing={5} alignItems="center" sx={{ textAlign: 'center', py: { xs: 5, md: 10 } }}>
          <m.div variants={varFade().inUp}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                fontWeight: 700,
                mb: 2,
              }}
            >
              Чистый воздух по подписке
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
              Получите современный очиститель воздуха за фиксированную ежемесячную плату
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Button
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
              Оформить подписку
            </Button>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop"
              alt="Air Purifier"
              sx={{
                width: { xs: '100%', md: '600px' },
                maxWidth: '100%',
                borderRadius: 2,
                boxShadow: theme.customShadows.z24,
                mt: 5,
              }}
            />
          </m.div>
        </Stack>
      </Container>
    </Box>
  );
}

