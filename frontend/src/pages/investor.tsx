import { Helmet } from 'react-helmet-async';
// sections
import { InvestorView } from 'src/sections/investor';

// ----------------------------------------------------------------------

export default function InvestorPage() {
  return (
    <>
      <Helmet>
        <title>Airly - Invest in Clean Air</title>
      </Helmet>

      <InvestorView />
    </>
  );
}

