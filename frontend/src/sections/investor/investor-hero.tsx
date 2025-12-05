import { m } from 'framer-motion';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
// components
import { MotionContainer, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

export default function InvestorHero() {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: '80vh', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
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
              Инвестируйте в чистый воздух
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
              Купите очиститель воздуха — мы сдаём его в аренду и выплачиваем вам пассивный доход
              каждый месяц
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
              Стать инвестором
            </Button>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop"
              alt="Investment"
              sx={{
                width: { xs: '100%', md: '600px' },
                maxWidth: '100%',
                borderRadius: 2,
                boxShadow: (theme) => theme.customShadows.z24,
                mt: 5,
              }}
            />
          </m.div>
        </Stack>
      </Container>
    </Box>
  );
}

