import { Helmet } from 'react-helmet-async';
import { SignInView } from 'src/sections/auth/sign-in';
// sections

// ----------------------------------------------------------------------

export default function SignInPage() {
  return (
    <>
      <Helmet>
        <title> Sign In | Air Purifier</title>
      </Helmet>

      <SignInView />
    </>
  );
}

