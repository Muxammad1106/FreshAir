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
import { MotionContainer, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

const TESTIMONIALS = [
  {
    name: 'Анна Иванова',
    role: 'Москва',
    content: 'Отличный сервис! Чистый воздух в доме, и не нужно думать о замене фильтров.',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    name: 'Дмитрий Петров',
    role: 'Санкт-Петербург',
    content: 'Удобная подписка, все работает как часы. Рекомендую!',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    name: 'Мария Сидорова',
    role: 'Казань',
    content: 'Прекрасное решение для семьи. Дети дышат чистым воздухом.',
    avatar: 'https://i.pravatar.cc/150?img=3',
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
              Отзывы клиентов
            </Typography>
          </m.div>

          <Grid container spacing={3}>
            {TESTIMONIALS.map((testimonial) => (
              <Grid item xs={12} md={4} key={testimonial.name}>
                <m.div variants={varFade().inUp}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
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

