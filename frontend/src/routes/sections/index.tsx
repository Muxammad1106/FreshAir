import { Navigate, useRoutes } from 'react-router-dom';
//
import { mainRoutes } from './main';

import { authRoutes } from './auth';
import { clientRoutes } from './client';
import { investorDashboardRoutes } from './investor-dashboard';

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

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
