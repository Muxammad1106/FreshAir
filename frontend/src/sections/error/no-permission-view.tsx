import { m } from 'framer-motion';
// @mui
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
// routes
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
// components
import { MotionContainer, varBounce } from 'src/components/animate';
// assets
import { ForbiddenIllustration } from 'src/assets/illustrations';
// auth
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function NoPermissionView() {
  const { user } = useAuthContext();
  const userRole = user?.role || 'customer';

  return (
    <MotionContainer>
      <m.div variants={varBounce().in}>
        <Typography variant="h3" paragraph>
          No permission
        </Typography>
      </m.div>

      <m.div variants={varBounce().in}>
        <Typography sx={{ color: 'text.secondary' }}>
          You don&apos;t have permission to access this section.
          <br />
          Please return to your authorized section.
        </Typography>
      </m.div>

      <m.div variants={varBounce().in}>
        <ForbiddenIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
      </m.div>

      <m.div variants={varBounce().in}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          {userRole === 'customer' && (
            <Button component={RouterLink} href={paths.client.root} size="large" variant="contained">
              Go to Client Dashboard
            </Button>
          )}
          {userRole === 'investor' && (
            <Button component={RouterLink} href={paths.investor.root} size="large" variant="contained">
              Go to Investor Dashboard
            </Button>
          )}
          <Button component={RouterLink} href={paths.home.root} size="large" variant="outlined">
            Go to Home
          </Button>
        </Stack>
      </m.div>
    </MotionContainer>
  );
}

