import { useEffect, useReducer, useCallback, useMemo } from 'react';
//
import { AuthContext } from './auth-context';
import { isValidToken, setSession, getSession } from './utils';
import { ActionMapType, AuthStateType, AuthUserType } from '../../types';
import { authService, AuthResponse } from 'src/services';

// ----------------------------------------------------------------------

// Helper function to transform backend user data to frontend format
const transformUser = (userData: AuthResponse['user']): AuthUserType => {
  const role = userData.role === 'CUSTOMER' ? 'client' : 'investor';
  
  return {
    id: userData.id.toString(),
    displayName: `${userData.first_name} ${userData.last_name}`.trim() || userData.email,
    email: userData.email,
    firstName: userData.first_name,
    lastName: userData.last_name,
    role,
    company: userData.company,
  };
};

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

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = getSession();

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        // Fetch current user data from API
        try {
          const userData = await authService.getMe();
          const transformedUser = transformUser(userData);
          
          // Store role for quick access
          const role = userData.role === 'CUSTOMER' ? 'client' : 'investor';
          sessionStorage.setItem('userRole', role);

          dispatch({
            type: Types.INITIAL,
            payload: {
              user: transformedUser,
            },
          });
        } catch (error) {
          // Token might be invalid, clear session
          console.error('Failed to fetch user data:', error);
          setSession(null);
          dispatch({
            type: Types.INITIAL,
            payload: {
              user: null,
            },
          });
        }
      } else {
        dispatch({
          type: Types.INITIAL,
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setSession(null);
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

  // LOGIN - Real API implementation
  const login = useCallback(
    async (email: string, password: string, role: 'client' | 'investor' = 'client') => {
      try {
        const response = await authService.signIn({ email, password });
        
        // Store token and set session
        setSession(response.token);
        
        // Store role for quick access
        const userRole = response.role === 'CUSTOMER' ? 'client' : 'investor';
        sessionStorage.setItem('userRole', userRole);

        // Transform and dispatch user data
        const transformedUser = transformUser(response.user);
        
        dispatch({
          type: Types.LOGIN,
          payload: {
            user: transformedUser,
          },
        });
      } catch (error) {
        // Re-throw error to be handled by the component
        throw error;
      }
    },
    []
  );

  // REGISTER - Real API implementation
  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      role: 'client' | 'investor' = 'client'
    ) => {
      try {
        // Convert frontend role to backend role
        const backendRole = role === 'client' ? 'CUSTOMER' : 'INVESTOR';
        const fullName = `${firstName} ${lastName}`.trim();

        const response = await authService.signUp({
          email,
          password,
          full_name: fullName,
          role: backendRole,
        });

        // Store token and set session
        setSession(response.token);
        
        // Store role for quick access
        const userRole = response.role === 'CUSTOMER' ? 'client' : 'investor';
        sessionStorage.setItem('userRole', userRole);

        // Transform and dispatch user data
        const transformedUser = transformUser(response.user);

        dispatch({
          type: Types.REGISTER,
          payload: {
            user: transformedUser,
          },
        });
      } catch (error) {
        // Re-throw error to be handled by the component
        throw error;
      }
    },
    []
  );

  // LOGOUT - Real API implementation
  const logout = useCallback(async () => {
    try {
      // Call backend to invalidate token
      await authService.signOut();
    } catch (error) {
      // Even if backend call fails, clear local session
      console.error('Sign out error:', error);
    } finally {
      // Always clear local session
      setSession(null);
      dispatch({
        type: Types.LOGOUT,
      });
    }
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
