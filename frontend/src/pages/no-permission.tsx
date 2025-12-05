import { Helmet } from 'react-helmet-async';
// sections
import { NoPermissionView } from 'src/sections/error';

// ----------------------------------------------------------------------

export default function NoPermissionPage() {
  return (
    <>
      <Helmet>
        <title> No Permission</title>
      </Helmet>

      <NoPermissionView />
    </>
  );
}

