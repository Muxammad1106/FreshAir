import { Helmet } from 'react-helmet-async';
// sections
import { HomeView } from 'src/sections/home';

// ----------------------------------------------------------------------

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Airly - Clean Air Subscription</title>
      </Helmet>

      <HomeView />
    </>
  );
}

