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
    question: 'Какой минимальный размер инвестиции?',
    answer: 'Минимальная инвестиция составляет $300 за одно устройство. Вы можете инвестировать в несколько устройств.',
  },
  {
    question: 'Как часто выплачивается доход?',
    answer: 'Доход выплачивается ежемесячно на ваш счет. Обычно выплаты происходят в первых числах месяца.',
  },
  {
    question: 'Что происходит, если подписчик отменит подписку?',
    answer:
      'Мы сразу находим нового подписчика и переустанавливаем устройство. Ваш доход не прерывается.',
  },
  {
    question: 'Могу ли я продать устройство обратно?',
    answer:
      'Да, вы можете продать устройство обратно компании в любой момент по остаточной стоимости.',
  },
  {
    question: 'Какие гарантии я получаю?',
    answer:
      'Мы гарантируем обслуживание устройств, поиск подписчиков и регулярные выплаты. Все это прописано в договоре.',
  },
  {
    question: 'Как я могу отслеживать свои инвестиции?',
    answer:
      'Вы получаете доступ к личному кабинету инвестора, где видите все свои устройства, доходность и транзакции.',
  },
  {
    question: 'Есть ли налоги на доход?',
    answer:
      'Доход от инвестиций облагается налогом согласно законодательству. Мы предоставляем все необходимые документы для налоговой.',
  },
  {
    question: 'Что если устройство сломается?',
    answer:
      'Мы полностью отвечаем за работоспособность. В случае поломки мы бесплатно ремонтируем или заменяем устройство.',
  },
  {
    question: 'Могу ли я инвестировать в несколько устройств?',
    answer:
      'Да, вы можете инвестировать в любое количество устройств. Каждое устройство приносит отдельный доход.',
  },
  {
    question: 'Как быстро я начну получать доход?',
    answer:
      'После покупки устройства мы находим подписчика в течение 1-2 недель, и вы начинаете получать доход со следующего месяца.',
  },
];

// ----------------------------------------------------------------------

export default function InvestorFaq() {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'background.neutral' }}>
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

