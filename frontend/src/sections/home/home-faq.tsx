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
    question: 'How does the subscription work?',
    answer:
      'You choose a plan, we deliver and install the air purifier at your location, and you pay a fixed monthly fee. We handle all maintenance, filter replacements, and support.',
  },
  {
    question: 'What\'s included in the subscription?',
    answer:
      'Everything! The air purifier device, professional installation, regular maintenance, filter replacements, repairs, and 24/7 technical support are all included.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer:
      'Yes, you can cancel anytime with no penalties. We\'ll pick up the device and you\'ll stop paying immediately.',
  },
  {
    question: 'How often are filters replaced?',
    answer:
      'Filter replacement frequency depends on your plan: Basic - every 6 months, Standard - every 3 months, Premium - every month. We handle it automatically.',
  },
  {
    question: 'What if the device breaks?',
    answer:
      'We fully cover all repairs and replacements. If your device breaks, we\'ll fix or replace it at no extra cost to you.',
  },
  {
    question: 'Is there a minimum subscription period?',
    answer: 'No minimum commitment required. Cancel anytime without fees or penalties.',
  },
  {
    question: 'Do you deliver nationwide?',
    answer:
      'Yes, we deliver and install across the United States. Delivery and installation are included in your first month.',
  },
  {
    question: 'How does installation work?',
    answer:
      'Our certified technician will schedule a convenient time, install the device, show you how to use it, set up monitoring, and answer any questions.',
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
              Frequently Asked Questions
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
              Everything you need to know about FreshAir subscriptions
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

