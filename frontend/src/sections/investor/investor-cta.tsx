import { m } from 'framer-motion';
// @mui
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

export default function InvestorCta() {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 },
        bgcolor: (theme) => theme.palette.primary.main,
        color: 'primary.contrastText',
      }}
    >
      <Container component={MotionContainer}>
        <Stack spacing={5} alignItems="center" sx={{ textAlign: 'center' }}>
          <m.div variants={varFade().inUp}>
            <Typography
              variant="h2"
              sx={{
                color: 'primary.contrastText',
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Start Investing Now
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography
              variant="h6"
              sx={{
                color: 'primary.contrastText',
                opacity: 0.9,
                maxWidth: 600,
                mb: 5,
              }}
            >
              Join investors who are already receiving passive income from clean air
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Button
              component={RouterLink}
              href={`${paths.auth.jwt.register}?role=investor`}
              size="large"
              variant="contained"
              sx={{
                px: 5,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                bgcolor: 'background.paper',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'background.paper',
                  opacity: 0.9,
                },
              }}
            >
              Become Investor
            </Button>
          </m.div>
        </Stack>
      </Container>
    </Box>
  );
}

