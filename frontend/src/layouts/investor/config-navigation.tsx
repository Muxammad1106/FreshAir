import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// components
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  dashboard: icon('ic_dashboard'),
  banking: icon('ic_banking'),
  analytics: icon('ic_analytics'),
  settings: icon('ic_lock'),
};

// ----------------------------------------------------------------------

export function useInvestorNavData() {
  const data = useMemo(
    () => [
      {
        subheader: 'Investor Dashboard',
        items: [
          { title: 'Portfolio', path: paths.investor.root, icon: ICONS.dashboard },
          { title: 'Earnings', path: paths.investor.earnings, icon: ICONS.banking },
          { title: 'Settings', path: paths.investor.settings, icon: ICONS.settings },
        ],
      },
    ],
    []
  );

  return data;
}

