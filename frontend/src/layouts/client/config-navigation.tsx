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
  analytics: icon('ic_analytics'),
  product: icon('ic_product'),
  settings: icon('ic_lock'),
  order: icon('ic_product'), // Используем иконку продукта для заказов
  subscription: icon('ic_banking'), // Используем иконку банковских операций для подписок
};

// ----------------------------------------------------------------------

export function useClientNavData() {
  const data = useMemo(
    () => [
      {
        subheader: 'Client Dashboard',
        items: [
          { title: 'Overview', path: paths.client.overview, icon: ICONS.dashboard },
          { title: 'Orders', path: paths.client.orders, icon: ICONS.order },
          { title: 'Payment', path: paths.client.payment, icon: ICONS.analytics },
          { title: 'Subscriptions', path: paths.client.subscriptions, icon: ICONS.subscription },
          { title: 'Devices', path: paths.client.devices, icon: ICONS.product },
          { title: 'Settings', path: paths.client.settings, icon: ICONS.settings },
        ],
      },
    ],
    []
  );

  return data;
}

