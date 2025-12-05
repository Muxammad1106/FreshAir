import { lazy } from 'react';
import { Outlet } from 'react-router-dom';
// layouts
import CompactLayout from 'src/layouts/compact';
import LandingLayout from 'src/layouts/landing';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/404'));
const HomePage = lazy(() => import('src/pages/home'));
const InvestorPage = lazy(() => import('src/pages/investor'));

// ----------------------------------------------------------------------

export const mainRoutes = [
  {
    element: (
      <LandingLayout>
        <Outlet />
      </LandingLayout>
    ),
    children: [
      { path: '/', element: <HomePage /> },
      { path: 'investor', element: <InvestorPage /> },
    ],
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
