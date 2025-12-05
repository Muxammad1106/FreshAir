import { useEffect, useReducer, useCallback, useMemo } from 'react';
//
import { _mock } from 'src/_mock';
//
import { AuthContext } from './auth-context';
import { isValidToken, setSession } from './utils';
import { ActionMapType, AuthStateType, AuthUserType } from '../../types';

// ----------------------------------------------------------------------

// NOTE:
// Mock authentication - no real API calls

// ----------------------------------------------------------------------

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
}

type Payload = {
  [Types.INITIAL]: {
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  user: null,
  loading: true,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === Types.REGISTER) {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';

// Mock user data
const getMockUser = (
  email?: string,
  firstName?: string,
  lastName?: string,
  role: 'client' | 'investor' = 'client'
): AuthUserType => ({
  id: '8864c717-587d-472a-929a-8e5f298024da-0',
  displayName: firstName && lastName ? `${firstName} ${lastName}` : 'Jaydon Frankie',
  email: email || 'demo@minimals.cc',
  photoURL: _mock.image.avatar(24),
  phoneNumber: '+40 777666555',
  country: 'United States',
  address: '90210 Broadway Blvd',
  state: 'California',
  city: 'San Francisco',
  zipCode: '94116',
  about: 'Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus.',
  role,
  isPublic: true,
});

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        // Mock: return user from storage or default mock user
        const storedRole = (sessionStorage.getItem('userRole') as 'client' | 'investor') || 'client';
        const mockUser = getMockUser(undefined, undefined, undefined, storedRole);

        dispatch({
          type: Types.INITIAL,
          payload: {
            user: mockUser,
          },
        });
      } else {
        dispatch({
          type: Types.INITIAL,
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: Types.INITIAL,
        payload: {
          user: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN - Mock implementation
  const login = useCallback(
    async (email: string, password: string, role: 'client' | 'investor' = 'client') => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock: always succeed, return mock user with role
      const mockUser = getMockUser(email, undefined, undefined, role);
      const mockToken = `mock-access-token-${Date.now()}`;

      setSession(mockToken);
      sessionStorage.setItem('userRole', role);

      dispatch({
        type: Types.LOGIN,
        payload: {
          user: mockUser,
        },
      });
    },
    []
  );

  // REGISTER - Mock implementation
  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      role: 'client' | 'investor' = 'client'
    ) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock: always succeed, return mock user with role
      const mockUser = getMockUser(email, firstName, lastName, role);
      const mockToken = `mock-access-token-${Date.now()}`;

      sessionStorage.setItem(STORAGE_KEY, mockToken);
      sessionStorage.setItem('userRole', role);
      setSession(mockToken);

      dispatch({
        type: Types.REGISTER,
        payload: {
          user: mockUser,
        },
      });
    },
    []
  );

  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null);
    dispatch({
      type: Types.LOGOUT,
    });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      register,
      logout,
    }),
    [login, logout, register, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
