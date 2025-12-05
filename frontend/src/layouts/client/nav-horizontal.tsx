import { memo } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
// theme
import { bgBlur } from 'src/theme/css';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// components
import { NavSectionHorizontal } from 'src/components/nav-section';
//
import { HEADER } from '../config-layout';
import { useClientNavData } from './config-navigation';
import { HeaderShadow } from '../_common';

// ----------------------------------------------------------------------

function ClientNavHorizontal() {
  const theme = useTheme();

  const { user } = useAuthContext();

  const navData = useClientNavData();

  return (
    <AppBar
      component="nav"
      sx={{
        top: HEADER.H_DESKTOP_OFFSET,
      }}
    >
      <Toolbar
        sx={{
          ...bgBlur({
            color: theme.palette.background.default,
          }),
        }}
      >
        <NavSectionHorizontal
          data={navData}
          config={{
            currentRole: (user?.role as string) || 'client',
          }}
        />
      </Toolbar>

      <HeaderShadow />
    </AppBar>
  );
}

export default memo(ClientNavHorizontal);

