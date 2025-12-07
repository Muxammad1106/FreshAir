import { forwardRef } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Link from '@mui/material/Link';
import Box, { BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// routes
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, ...other }, ref) => {
    const theme = useTheme();

    const PRIMARY_MAIN = theme.palette.primary.main;
    const PRIMARY_LIGHT = theme.palette.primary.light;

    // OR using local (public folder)
    // -------------------------------------------------------
    // const logo = (
    //   <Box
    //     component="img"
    //     src="/logo/logo_single.svg" => your path
    //     sx={{ width: 40, height: 40, cursor: 'pointer', ...sx }}
    //   />
    // );

    const logo = (
      <Box
        ref={ref}
        component="div"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          ...sx,
        }}
        {...other}
      >
        {/* Иконка воздуха */}
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="airGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={PRIMARY_LIGHT} />
                <stop offset="100%" stopColor={PRIMARY_MAIN} />
              </linearGradient>
            </defs>
            
            {/* Круг (символ чистоты) */}
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="url(#airGradient)"
              strokeWidth="3"
              opacity="0.3"
            />
            
            {/* Лист/воздух в центре */}
            <path
              d="M50 20 
                 C45 15, 38 18, 35 25 
                 C32 30, 35 35, 40 38 
                 C38 42, 40 48, 45 50 
                 C50 52, 55 50, 60 48 
                 C65 45, 68 40, 65 35 
                 C68 30, 65 25, 60 22 
                 C55 18, 50 20, 50 20 Z"
              fill="url(#airGradient)"
              opacity="0.9"
            />
            
            {/* Волнистые линии воздуха */}
            <path
              d="M25 50 Q35 45, 45 50 T65 50"
              fill="none"
              stroke="url(#airGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M20 65 Q30 60, 40 65 T60 65"
              fill="none"
              stroke="url(#airGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M30 35 Q40 30, 50 35 T70 35"
              fill="none"
              stroke="url(#airGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
        </Box>

        {/* Текст FreshAir */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, ${PRIMARY_MAIN} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: 0.5,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          FreshAir
        </Typography>
      </Box>
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <Link component={RouterLink} href="/" sx={{ display: 'contents' }}>
        {logo}
      </Link>
    );
  }
);

export default Logo;
