// sections
import InvestorHero from './investor-hero';
import InvestorHowItWorks from './investor-how-it-works';
import InvestorIncomeModel from './investor-income-model';
import InvestorRisk from './investor-risk';
import InvestorFaq from './investor-faq';
import InvestorCta from './investor-cta';
import InvestorFooter from './investor-footer';

// ----------------------------------------------------------------------

export default function InvestorView() {
  return (
    <>
      <InvestorHero />
      <InvestorHowItWorks />
      <InvestorIncomeModel />
      <InvestorRisk />
      <InvestorFaq />
      <InvestorCta />
      <InvestorFooter />
    </>
  );
}

