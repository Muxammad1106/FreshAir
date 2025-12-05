import { useLocation } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
//
import { HeaderLanding as Header } from '../_common';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function LandingLayout({ children }: Props) {
  const location = useLocation();
  const isInvestor = location.pathname === '/investor';

  const homeNavItems = [
    { label: 'Home', href: '/' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  const investorNavItems = [
    { label: 'Overview', href: '/investor' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Income Model', href: '#income-model' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <>
      <Header
        navItems={isInvestor ? investorNavItems : homeNavItems}
        ctaLabel={isInvestor ? 'Назад' : 'Стать инвестором'}
        ctaHref={isInvestor ? '/' : '/investor'}
      />
      <Box component="main">{children}</Box>
    </>
  );
}

