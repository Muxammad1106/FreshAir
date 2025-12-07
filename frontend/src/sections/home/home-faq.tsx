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
      'You choose a plan, we deliver and install the air purifier, and you pay a fixed monthly fee. We handle all maintenance and filter replacements.',
  },
  {
    question: 'What is included in the subscription price?',
    answer:
      'The subscription includes the air purifier device, installation, regular maintenance, filter replacements, and technical support.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer:
      'Yes, you can cancel your subscription at any time. We will pick up the device and you will stop paying.',
  },
  {
    question: 'How often are filters replaced?',
    answer:
      'Filter replacement frequency depends on your plan: Basic - every 6 months, Standard - every 3 months.',
  },
  {
    question: 'What if the device breaks?',
    answer:
      'We are fully responsible for device functionality. In case of breakdown, we will repair or replace it free of charge.',
  },
  {
    question: 'Is there a minimum subscription period?',
    answer: 'No, there is no minimum period. You can cancel your subscription at any time.',
  },
  {
    question: 'Do you deliver to all regions?',
    answer:
      'Yes, we deliver to all service areas. Delivery cost depends on the region and is included in the first month subscription.',
  },
  {
    question: 'How does installation work?',
    answer:
      'Our specialist will come at your convenient time, install the device, show you how to use it, and set up monitoring.',
  },
];

// ----------------------------------------------------------------------

export default function HomeFaq() {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box id="faq" sx={{ py: { xs: 10, md: 15 }, bgcolor: 'background.default' }}>
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

