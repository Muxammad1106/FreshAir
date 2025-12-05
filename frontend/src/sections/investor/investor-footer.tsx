// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
// components
import Iconify from 'src/components/iconify';
import Logo from 'src/components/logo';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export default function InvestorFooter() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.neutral',
        py: { xs: 5, md: 8 },
      }}
    >
      <Container>
        <Grid container spacing={5}>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Logo />
              <Typography variant="body2" color="text.secondary">
                Инвестируйте в чистый воздух. Пассивный доход от аренды очистителей воздуха.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Link
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener"
                  sx={{ color: 'text.secondary' }}
                >
                  <Iconify icon="eva:facebook-fill" width={24} />
                </Link>
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener"
                  sx={{ color: 'text.secondary' }}
                >
                  <Iconify icon="eva:instagram-fill" width={24} />
                </Link>
                <Link
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener"
                  sx={{ color: 'text.secondary' }}
                >
                  <Iconify icon="eva:twitter-fill" width={24} />
                </Link>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Инвесторам
            </Typography>
            <Stack spacing={1}>
              <Link component={RouterLink} href="/investor-landing" color="inherit" variant="body2">
                Обзор
              </Link>
              <Link component={RouterLink} href="/investor-landing" color="inherit" variant="body2">
                Модель дохода
              </Link>
              <Link component={RouterLink} href="/investor-landing" color="inherit" variant="body2">
                FAQ
              </Link>
            </Stack>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Поддержка
            </Typography>
            <Stack spacing={1}>
              <Link component={RouterLink} href="/investor-landing" color="inherit" variant="body2">
                FAQ
              </Link>
              <Link component={RouterLink} href="/investor-landing" color="inherit" variant="body2">
                Помощь
              </Link>
              <Link component={RouterLink} href="/" color="inherit" variant="body2">
                Для клиентов
              </Link>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Контакты
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="eva:email-fill" width={20} />
                <Typography variant="body2">investors@airpurifier.ru</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="eva:phone-fill" width={20} />
                <Typography variant="body2">+7 (800) 123-45-67</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="eva:pin-fill" width={20} />
                <Typography variant="body2">Москва, ул. Примерная, 1</Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5 }} />

        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <Typography variant="body2" color="text.secondary">
            © 2024 Air Purifier. Все права защищены.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link component={RouterLink} href="/investor-landing" color="inherit" variant="body2">
              Политика конфиденциальности
            </Link>
            <Link component={RouterLink} href="/investor-landing" color="inherit" variant="body2">
              Условия использования
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

