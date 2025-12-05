// @mui
import Box from '@mui/material/Box';
//
import { paths } from 'src/routes/paths';
import { HeaderLanding as Header } from '../_common';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function ClientLandingLayout({ children }: Props) {
  const homeNavItems = [
    { label: 'Home', href: '/' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <>
      <Header
        navItems={homeNavItems}
        ctaLabel="Стать инвестором"
        ctaHref={paths.home.investor}
        signInRole="client"
      />
      <Box component="main">{children}</Box>
    </>
  );
}

