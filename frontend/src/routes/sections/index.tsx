import { Suspense, lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// components
import { LoadingScreen } from 'src/components/loading-screen';
//
import { mainRoutes } from './main';

import { authRoutes } from './auth';
import { clientRoutes } from './client';
import { investorDashboardRoutes } from './investor-dashboard';

// ----------------------------------------------------------------------

const NoPermissionPage = lazy(() => import('src/pages/no-permission'));

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    // Main routes (landing pages)
    ...mainRoutes,

    // Auth routes
    ...authRoutes,

    // Client dashboard routes
    ...clientRoutes,

    // Investor dashboard routes
    ...investorDashboardRoutes,

    // Error pages
    {
      path: 'no-permission',
      element: (
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <NoPermissionPage />
          </Suspense>
        </AuthGuard>
      ),
    },

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
