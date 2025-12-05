import { Helmet } from 'react-helmet-async';
// sections
import { InvestorView } from 'src/sections/investor';

// ----------------------------------------------------------------------

export default function InvestorPage() {
  return (
    <>
      <Helmet>
        <title> Инвестируйте в чистый воздух | Air Purifier</title>
      </Helmet>

      <InvestorView />
    </>
  );
}

