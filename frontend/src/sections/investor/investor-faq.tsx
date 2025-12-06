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
    answer: 'The minimum investment is $300 per device. You can invest in multiple devices to diversify your portfolio.',
  },
  {
    question: 'How often are returns paid?',
    answer: 'Returns are paid monthly to your account. Payments typically occur in the first week of each month.',
  },
  {
    question: 'What happens if a subscriber cancels?',
    answer:
      'We immediately find a new subscriber and relocate the device. Your income stream continues without interruption.',
  },
  {
    question: 'Can I sell my device back?',
    answer:
      'Yes, you can sell your device back to us at any time at its residual value. No penalties or fees.',
  },
  {
    question: 'What guarantees do I receive?',
    answer:
      'We guarantee device maintenance, subscriber management, and regular payments. All terms are clearly outlined in the investment agreement.',
  },
  {
    question: 'How can I track my investments?',
    answer:
      'You get access to a comprehensive investor dashboard showing all your devices, returns, transactions, and performance metrics in real-time.',
  },
  {
    question: 'Are returns taxable?',
    answer:
      'Investment returns are subject to taxation according to local laws. We provide all necessary documentation for tax reporting.',
  },
  {
    question: 'What if a device breaks?',
    answer:
      'We fully cover all repairs and replacements. If your device breaks, we fix or replace it at no cost to you.',
  },
  {
    question: 'Can I invest in multiple devices?',
    answer:
      'Yes, you can invest in any number of devices. Each device generates separate returns, allowing you to build a diversified portfolio.',
  },
  {
    question: 'How quickly will I start earning returns?',
    answer:
      'After purchasing a device, we find a subscriber within 1-2 weeks, and you begin receiving returns starting the following month.',
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
              Frequently Asked Questions
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
              Everything you need to know about investing with FreshAir
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

