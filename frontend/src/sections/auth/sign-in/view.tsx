import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useCallback, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
  password: string;
};

export default function SignInView() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [errorMsg, setErrorMsg] = useState('');
  const [role, setRole] = useState<'customer' | 'investor'>('customer');

  const password = useBoolean();

  // Get role from query parameter or storage
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'investor' || roleParam === 'customer') {
      setRole(roleParam);
      sessionStorage.setItem('userRole', roleParam);
    } else {
      const storedRole = (sessionStorage.getItem('userRole') as 'customer' | 'investor') || 'customer';
      setRole(storedRole);
    }
  }, [searchParams]);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      try {
        setErrorMsg('');
        // Login returns role from backend response
        const userRole = await login?.(data.email, data.password, role);

        // Redirect based on role from backend response
        if (userRole === 'investor') {
          navigate(paths.investor.root);
        } else {
          navigate(paths.client.root);
        }
      } catch (error: any) {
        console.error('Login error:', error);
        reset();
        // Extract error message from error object
        const errorMessage = error?.message || error?.toString() || 'Failed to sign in. Please check your credentials.';
        setErrorMsg(errorMessage);
      }
    },
    [login, navigate, reset, role]
  );

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">Sign in</Typography>

      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2">Signing in as:</Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {role === 'investor' ? 'Investor' : 'Client'}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">New user?</Typography>

        <Link component={RouterLink} href={`${paths.auth.signUp}?role=${role}`} variant="subtitle2">
          Create an account
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <RHFTextField name="email" label="Email address" />

      <RHFTextField
        name="password"
        label="Password"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Link variant="body2" color="inherit" underline="always" sx={{ alignSelf: 'flex-end' }}>
        Forgot password?
      </Link>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Login
      </LoadingButton>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {renderHead}
      {renderForm}
    </FormProvider>
  );
}

