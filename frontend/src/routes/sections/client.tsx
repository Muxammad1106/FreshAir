import { Suspense, lazy } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { ClientGuard } from 'src/auth/guard';
// layouts
import ClientLayout from 'src/layouts/client';
// components
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const ClientPage = lazy(() => import('src/pages/client/page'));
const ClientOrdersPage = lazy(() => import('src/pages/client/orders/page'));
const ClientAnalyticsPage = lazy(() => import('src/pages/client/analytics/page'));
const ClientDevicesPage = lazy(() => import('src/pages/client/devices/page'));
const ClientSettingsPage = lazy(() => import('src/pages/client/settings/page'));

// ----------------------------------------------------------------------

export const clientRoutes = [
  {
    path: 'client',
    element: (
      <ClientGuard>
        <ClientLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </ClientLayout>
      </ClientGuard>
    ),
    children: [
      { element: <ClientPage />, index: true },
      { path: 'orders', element: <ClientOrdersPage /> },
      { path: 'analytics', element: <ClientAnalyticsPage /> },
      { path: 'devices', element: <ClientDevicesPage /> },
      { path: 'settings', element: <ClientSettingsPage /> },
    ],
  },
];

