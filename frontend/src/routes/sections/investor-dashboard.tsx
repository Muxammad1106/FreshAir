import { Suspense, lazy } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
import InvestorLayout from 'src/layouts/investor';
// components
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const InvestorPage = lazy(() => import('src/pages/investor/page'));
const InvestorEarningsPage = lazy(() => import('src/pages/investor/earnings/page'));
const InvestorSettingsPage = lazy(() => import('src/pages/investor/settings/page'));

// ----------------------------------------------------------------------

export const investorDashboardRoutes = [
  {
    path: 'investor',
    element: (
      <AuthGuard>
        <InvestorLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </InvestorLayout>
      </AuthGuard>
    ),
    children: [
      { element: <InvestorPage />, index: true },
      { path: 'earnings', element: <InvestorEarningsPage /> },
      { path: 'settings', element: <InvestorSettingsPage /> },
    ],
  },
];

