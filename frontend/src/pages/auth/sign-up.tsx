import { Helmet } from 'react-helmet-async';
import { SignUpView } from 'src/sections/auth/sign-up';
// sections

// ----------------------------------------------------------------------

export default function SignUpPage() {
  return (
    <>
      <Helmet>
        <title> Sign Up | Air Purifier</title>
      </Helmet>

      <SignUpView />
    </>
  );
}

