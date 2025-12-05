import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
// theme
import { bgBlur } from 'src/theme/css';
// hooks
import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';
// routes
import { paths } from 'src/routes/paths';
// components
import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
//
import { HEADER } from '../config-layout';
import HeaderShadow from './header-shadow';

// ----------------------------------------------------------------------

type HeaderLandingProps = {
  navItems?: Array<{ label: string; href: string }>;
  ctaLabel?: string;
  ctaHref?: string;
  signInRole?: 'client' | 'investor';
};

export default function HeaderLanding({ navItems = [], ctaLabel, ctaHref, signInRole }: HeaderLandingProps) {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mdUp = useResponsive('up', 'md');
  const offsetTop = useOffSetTop(HEADER.H_DESKTOP);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const signInUrl = signInRole ? `${paths.auth.jwt.login}?role=${signInRole}` : paths.auth.jwt.login;

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', pt: 3 }}>
      <Stack spacing={2} sx={{ px: 2 }}>
        {navItems.map((item) => (
          <Button
            key={item.href}
            component={RouterLink}
            href={item.href}
            color="inherit"
            fullWidth
            sx={{ justifyContent: 'flex-start' }}
          >
            {item.label}
          </Button>
        ))}
        
        {signInRole && (
          <Button
            component={RouterLink}
            href={signInUrl}
            color="inherit"
            fullWidth
            sx={{ justifyContent: 'flex-start' }}
          >
            Sign In
          </Button>
        )}

        {ctaLabel && ctaHref && (
          <Button
            component={RouterLink}
            href={ctaHref}
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            {ctaLabel}
          </Button>
        )}
      </Stack>
    </Box>
  );

  return (
    <>
      <AppBar
        sx={{
          ...bgBlur({
            color: theme.palette.background.default,
          }),
          boxShadow: 'none',
          borderBottom: `dashed 1px ${theme.palette.divider}`,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            height: {
              xs: HEADER.H_MOBILE,
              md: HEADER.H_DESKTOP,
            },
            transition: theme.transitions.create(['height'], {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.shorter,
            }),
            ...(offsetTop && {
              height: {
                md: HEADER.H_DESKTOP_OFFSET,
              },
            }),
          }}
        >
          <Logo />

          {mdUp ? (
            <Stack direction="row" alignItems="center" spacing={3}>
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  component={RouterLink}
                  href={item.href}
                  color="inherit"
                  sx={{ typography: 'subtitle2' }}
                >
                  {item.label}
                </Button>
              ))}

              {signInRole && (
                <Button
                  component={RouterLink}
                  href={signInUrl}
                  color="inherit"
                  sx={{ typography: 'subtitle2' }}
                >
                  Sign In
                </Button>
              )}

              {ctaLabel && ctaHref && (
                <Button
                  component={RouterLink}
                  href={ctaHref}
                  variant="contained"
                  color="primary"
                >
                  {ctaLabel}
                </Button>
              )}
            </Stack>
          ) : (
            <IconButton color="inherit" onClick={handleDrawerToggle}>
              <Iconify icon="eva:menu-2-fill" />
            </IconButton>
          )}
        </Toolbar>

        {offsetTop && <HeaderShadow />}
      </AppBar>

      {!mdUp && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
}
