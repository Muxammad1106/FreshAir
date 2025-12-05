// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  CLIENT: '/client',
  INVESTOR: '/investor',
  HOME: '/',
};

// ----------------------------------------------------------------------

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // HOME
  home: {
    root: ROOTS.HOME,
    investor: '/investor-landing',
  },
  // AUTH
  auth: {
    signIn: `${ROOTS.AUTH}/sign-in`,
    signUp: `${ROOTS.AUTH}/sign-up`,
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
  },
  // CLIENT DASHBOARD
  client: {
    root: ROOTS.CLIENT,
    overview: ROOTS.CLIENT,
    orders: `${ROOTS.CLIENT}/orders`,
    analytics: `${ROOTS.CLIENT}/analytics`,
    devices: `${ROOTS.CLIENT}/devices`,
    settings: `${ROOTS.CLIENT}/settings`,
  },
  // INVESTOR DASHBOARD
  investor: {
    root: ROOTS.INVESTOR,
    portfolio: `${ROOTS.INVESTOR}/portfolio`,
    earnings: `${ROOTS.INVESTOR}/earnings`,
    settings: `${ROOTS.INVESTOR}/settings`,
  },
  // ERROR
  error: {
    noPermission: '/no-permission',
  },
};
