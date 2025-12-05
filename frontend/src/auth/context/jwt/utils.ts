// utils
import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

// Mock token validation - just check if token exists
export const isValidToken = (accessToken: string) => {
  if (!accessToken) {
    return false;
  }

  // Mock: if token starts with 'mock-access-token-', it's valid
  return accessToken.startsWith('mock-access-token-');
};

// ----------------------------------------------------------------------

export const setSession = (accessToken: string | null) => {
  if (accessToken) {
    sessionStorage.setItem('accessToken', accessToken);

    // Set axios header with Token format (as required by Django backend)
    axios.defaults.headers.common.Authorization = `Token ${accessToken}`;
  } else {
    sessionStorage.removeItem('accessToken');

    delete axios.defaults.headers.common.Authorization;
  }
};
