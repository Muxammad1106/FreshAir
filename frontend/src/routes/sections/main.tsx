import { lazy } from 'react';
import { Outlet } from 'react-router-dom';
// layouts
import CompactLayout from 'src/layouts/compact';
import ClientLandingLayout from 'src/layouts/landing/client-layout';
import InvestorLandingLayout from 'src/layouts/landing/investor-layout';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/404'));
const HomePage = lazy(() => import('src/pages/home'));
const InvestorPage = lazy(() => import('src/pages/investor'));

// ----------------------------------------------------------------------

export const mainRoutes = [
  {
    path: '/',
    element: (
      <ClientLandingLayout>
        <HomePage />
      </ClientLandingLayout>
    ),
  },
  {
    path: 'investor-landing',
    element: (
      <InvestorLandingLayout>
        <InvestorPage />
      </InvestorLandingLayout>
    ),
  },
  {
    element: (
      <CompactLayout>
        <Outlet />
      </CompactLayout>
    ),
    children: [{ path: '404', element: <Page404 /> }],
  },
];
