// @mui
import Box from '@mui/material/Box';
//
import { paths } from 'src/routes/paths';
import { HeaderLanding as Header } from '../_common';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function InvestorLandingLayout({ children }: Props) {
  const investorNavItems = [
    { label: 'Overview', href: paths.home.investor },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Income Model', href: '#income-model' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <>
      <Header
        navItems={investorNavItems}
        ctaLabel="Back to Home"
        ctaHref="/"
        signInRole="investor"
      />
      <Box component="main">{children}</Box>
    </>
  );
}

