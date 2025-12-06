import { Helmet } from 'react-helmet-async';
// sections
import { HomeView } from 'src/sections/home';

// ----------------------------------------------------------------------

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Fresh Air Subscription | Air Purification Service</title>
      </Helmet>

      <HomeView />
    </>
  );
}

