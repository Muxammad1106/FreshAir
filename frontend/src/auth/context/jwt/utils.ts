// utils
import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

/**
 * Validate JWT token format
 * JWT tokens consist of three parts separated by dots: header.payload.signature
 * @param accessToken - Token string to validate
 * @returns true if token has valid JWT format
 */
export const isValidToken = (accessToken: string): boolean => {
  if (!accessToken) {
    return false;
  }

  // JWT tokens have 3 parts separated by dots
  const parts = accessToken.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Each part should be non-empty
  return parts.every((part) => part.length > 0);
};

// ----------------------------------------------------------------------

/**
 * Set authentication session
 * Stores token in sessionStorage and sets axios default header
 * @param accessToken - Token string or null to clear session
 */
export const setSession = (accessToken: string | null): void => {
  if (accessToken) {
    sessionStorage.setItem('accessToken', accessToken);

    // Set axios header with Token format (as required by Django backend)
    axios.defaults.headers.common.Authorization = `Token ${accessToken}`;
  } else {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userRole');

    delete axios.defaults.headers.common.Authorization;
  }
};

/**
 * Get stored access token
 * @returns Token string or null if not found
 */
export const getSession = (): string | null => {
  return sessionStorage.getItem('accessToken');
};
