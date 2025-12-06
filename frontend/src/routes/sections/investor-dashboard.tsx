import { Suspense, lazy } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { InvestorGuard } from 'src/auth/guard';
// layouts
import InvestorLayout from 'src/layouts/investor';
// components
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const InvestorPage = lazy(() => import('src/pages/investor/page'));
const InvestorInvestmentsPage = lazy(() => import('src/pages/investor/investments/page'));
const InvestorAnalyticsPage = lazy(() => import('src/pages/investor/analytics/page'));
const InvestorTransactionsPage = lazy(() => import('src/pages/investor/transactions/page'));
const InvestorEarningsPage = lazy(() => import('src/pages/investor/earnings/page'));
const InvestorSettingsPage = lazy(() => import('src/pages/investor/settings/page'));

// ----------------------------------------------------------------------

export const investorDashboardRoutes = [
  {
    path: 'investor',
    element: (
      <InvestorGuard>
        <InvestorLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </InvestorLayout>
      </InvestorGuard>
    ),
    children: [
      { element: <InvestorPage />, index: true },
      { path: 'investments', element: <InvestorInvestmentsPage /> },
      { path: 'analytics', element: <InvestorAnalyticsPage /> },
      { path: 'transactions', element: <InvestorTransactionsPage /> },
      { path: 'earnings', element: <InvestorEarningsPage /> },
      { path: 'settings', element: <InvestorSettingsPage /> },
    ],
  },
];

