// @mui
import Box from '@mui/material/Box';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
//
import Main from '../dashboard/main';
import Header from '../dashboard/header';
import ClientNavVertical from './nav-vertical';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function ClientLayout({ children }: Props) {
  const nav = useBoolean();

  const renderNavVertical = <ClientNavVertical openNav={nav.value} onCloseNav={nav.onFalse} />;

  return (
    <>
      <Header onOpenNav={nav.onTrue} />

      <Box
        sx={{
          display: { lg: 'flex' },
          minHeight: { lg: 1 },
        }}
      >
        {renderNavVertical}

        <Main>{children}</Main>
      </Box>
    </>
  );
}

