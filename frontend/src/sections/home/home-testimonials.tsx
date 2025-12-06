import { m } from 'framer-motion';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
// components
import Iconify from 'src/components/iconify';
import { MotionContainer, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

const TESTIMONIALS = [
  {
    name: 'Sarah Johnson',
    role: 'New York, NY',
    content: 'Amazing service! The air quality in our home has improved dramatically. No more worrying about filter replacements - they handle everything.',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'San Francisco, CA',
    content: 'The subscription model is perfect. Affordable monthly payments and zero maintenance hassle. The real-time monitoring is a game-changer.',
    avatar: 'https://i.pravatar.cc/150?img=2',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Austin, TX',
    content: 'Best investment for our family\'s health. The kids breathe cleaner air, and I love the peace of mind knowing everything is taken care of.',
    avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
  },
];

// ----------------------------------------------------------------------

export default function HomeTestimonials() {
  return (
    <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'background.neutral' }}>
      <Container component={MotionContainer}>
        <Stack spacing={5} alignItems="center">
          <m.div variants={varFade().inUp}>
            <Typography variant="h2" sx={{ textAlign: 'center', mb: 2 }}>
              What Our Customers Say
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
              Join thousands of satisfied customers breathing cleaner air
            </Typography>
          </m.div>

          <Grid container spacing={3}>
            {TESTIMONIALS.map((testimonial) => (
              <Grid item xs={12} md={4} key={testimonial.name}>
                <m.div variants={varFade().inUp}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={0.5}>
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Iconify
                              key={i}
                              icon="solar:star-bold"
                              sx={{ color: 'warning.main', width: 20, height: 20 }}
                            />
                          ))}
                        </Stack>
                        <Typography variant="body1" color="text.secondary">
                          &ldquo;{testimonial.content}&rdquo;
                        </Typography>

                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar src={testimonial.avatar} alt={testimonial.name} />
                          <Box>
                            <Typography variant="subtitle2">{testimonial.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {testimonial.role}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </m.div>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

