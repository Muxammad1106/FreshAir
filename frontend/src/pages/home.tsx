import { Helmet } from 'react-helmet-async';
// sections
import { HomeView } from 'src/sections/home';

// ----------------------------------------------------------------------

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title> Чистый воздух по подписке | Air Purifier</title>
      </Helmet>

      <HomeView />
    </>
  );
}

