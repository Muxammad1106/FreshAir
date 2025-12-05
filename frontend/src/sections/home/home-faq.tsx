import { m } from 'framer-motion';
import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Stack from '@mui/material/Stack';
// components
import Iconify from 'src/components/iconify';
import { MotionContainer, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

const FAQS = [
  {
    question: 'Как работает подписка?',
    answer:
      'Вы выбираете тариф, мы доставляем очиститель воздуха, и вы платите фиксированную ежемесячную плату. Мы берем на себя обслуживание и замену фильтров.',
  },
  {
    question: 'Что входит в стоимость подписки?',
    answer:
      'В стоимость входит сам очиститель воздуха, его установка, регулярное обслуживание, замена фильтров и техническая поддержка.',
  },
  {
    question: 'Можно ли отменить подписку?',
    answer:
      'Да, вы можете отменить подписку в любой момент. Мы заберем устройство, и вы больше не будете платить.',
  },
  {
    question: 'Как часто меняются фильтры?',
    answer:
      'Частота замены фильтров зависит от выбранного тарифа: Basic - раз в 6 месяцев, Standard - раз в 3 месяца, Premium - раз в месяц.',
  },
  {
    question: 'Что делать, если устройство сломается?',
    answer:
      'Мы полностью отвечаем за работоспособность устройства. В случае поломки мы бесплатно отремонтируем или заменим его.',
  },
  {
    question: 'Есть ли минимальный срок подписки?',
    answer: 'Нет, минимального срока нет. Вы можете отменить подписку в любой момент.',
  },
  {
    question: 'Доставляете ли вы в регионы?',
    answer:
      'Да, мы доставляем по всей России. Стоимость доставки зависит от региона и включена в первый месяц подписки.',
  },
  {
    question: 'Как происходит установка?',
    answer:
      'Наш специалист приедет к вам в удобное время, установит устройство, покажет как им пользоваться и настроит мониторинг.',
  },
];

// ----------------------------------------------------------------------

export default function HomeFaq() {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'background.default' }}>
      <Container component={MotionContainer}>
        <Stack spacing={5}>
          <m.div variants={varFade().inUp}>
            <Typography variant="h2" sx={{ textAlign: 'center', mb: 2 }}>
              Часто задаваемые вопросы
            </Typography>
          </m.div>

          <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
            {FAQS.map((faq, index) => (
              <m.div key={faq.question} variants={varFade().inUp}>
                <Accordion
                  expanded={expanded === `panel${index}`}
                  onChange={handleChange(`panel${index}`)}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary
                    expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                  >
                    <Typography variant="subtitle1">{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </m.div>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

