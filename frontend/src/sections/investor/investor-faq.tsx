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
    question: 'What is the minimum investment amount?',
    answer: 'The minimum investment is $100 per device. You can invest in multiple devices. Maximum investment per device is $1000.',
  },
  {
    question: 'How often is income paid?',
    answer: 'Income is paid monthly to your account. Payments usually occur in the first days of the month.',
  },
  {
    question: 'What happens if a subscriber cancels their subscription?',
    answer:
      'We immediately find a new subscriber and reinstall the device. Your income is not interrupted.',
  },
  {
    question: 'Can I sell the device back?',
    answer:
      'Yes, you can sell the device back to the company at any time at residual value.',
  },
  {
    question: 'What guarantees do I get?',
    answer:
      'We guarantee device maintenance, subscriber search, and regular payments. All of this is specified in the contract.',
  },
  {
    question: 'How can I track my investments?',
    answer:
      'You get access to an investor dashboard where you can see all your devices, returns, and transactions.',
  },
  {
    question: 'Are there taxes on income?',
    answer:
      'Investment income is subject to tax according to legislation. We provide all necessary documents for tax purposes.',
  },
  {
    question: 'What if the device breaks?',
    answer:
      'We are fully responsible for functionality. In case of breakdown, we repair or replace the device free of charge.',
  },
  {
    question: 'Can I invest in multiple devices?',
    answer:
      'Yes, you can invest in any number of devices. Each device generates separate income.',
  },
  {
    question: 'How quickly will I start receiving income?',
    answer:
      'After purchasing a device, we find a subscriber within 1-2 weeks, and you start receiving income from the next month.',
  },
];

// ----------------------------------------------------------------------

export default function InvestorFaq() {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box id="faq" sx={{ py: { xs: 10, md: 15 }, bgcolor: 'background.neutral' }}>
      <Container component={MotionContainer}>
        <Stack spacing={5}>
          <m.div variants={varFade().inUp}>
            <Typography variant="h2" sx={{ textAlign: 'center', mb: 2 }}>
              Frequently Asked Questions
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

