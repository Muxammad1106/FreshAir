import { useEffect, useCallback, useState } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
//
import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

type ClientGuardProps = {
  children: React.ReactNode;
};

export default function ClientGuard({ children }: ClientGuardProps) {
  const router = useRouter();

  const { authenticated, user, loading } = useAuthContext();

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    // Wait for auth to finish loading
    if (loading) {
      return;
    }

    if (!authenticated) {
      const searchParams = new URLSearchParams({ returnTo: window.location.href }).toString();
      const href = `${paths.auth.jwt.login}?${searchParams}`;
      router.replace(href);
      return;
    }

    // Check if user is customer
    const userRole = user?.role;
    if (userRole !== 'customer') {
      // Redirect to no permission page
      router.replace(paths.error.noPermission);
      return;
    }

    setChecked(true);
  }, [authenticated, user, loading, router]);

  useEffect(() => {
    check();
  }, [check]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}

