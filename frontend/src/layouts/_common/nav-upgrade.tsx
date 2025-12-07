// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
// auth
import { useAuthContext } from 'src/auth/hooks';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// locales
// components
import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function NavUpgrade() {
  const { user } = useAuthContext();

  return (
    <Stack
      sx={{
        px: 2,
        py: 5,
        textAlign: 'center',
      }}
    >
      <Stack alignItems="center">
        <Box sx={{ position: 'relative' }}>
          <Avatar 
            alt={user?.displayName} 
            sx={{ 
              width: 48, 
              height: 48,
              bgcolor: 'primary.main',
            }}
          >
            {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          {user?.role && (
            <Label
              color={user.role === 'investor' ? 'info' : 'success'}
              variant="filled"
              sx={{
                top: -6,
                px: 0.5,
                left: 40,
                height: 20,
                position: 'absolute',
                borderBottomLeftRadius: 2,
                textTransform: 'capitalize',
              }}
            >
              {user.role}
            </Label>
          )}
        </Box>

        <Stack spacing={0.5} sx={{ mt: 1.5, mb: 2 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.displayName}
          </Typography>

          <Typography variant="body2" noWrap sx={{ color: 'text.disabled' }}>
            {user?.email}
          </Typography>
        </Stack>

        <Button variant="outlined" component={RouterLink} href={paths.client.settings}>
          Настройки
        </Button>
      </Stack>
    </Stack>
  );
}
