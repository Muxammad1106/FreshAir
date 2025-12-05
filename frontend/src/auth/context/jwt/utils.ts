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
 * Stores token in sessionStorage
 * Note: Token is automatically added by axios interceptor for protected endpoints
 * @param accessToken - Token string or null to clear session
 */
export const setSession = (accessToken: string | null): void => {
  if (accessToken) {
    sessionStorage.setItem('accessToken', accessToken);
    // Token will be automatically added by axios interceptor for protected endpoints
    // We don't set it globally to avoid sending it to public endpoints (login, register)
  } else {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userRole');
    // Token removal is handled by interceptor checking sessionStorage
  }
};

/**
 * Get stored access token
 * @returns Token string or null if not found
 */
export const getSession = (): string | null => sessionStorage.getItem('accessToken');
