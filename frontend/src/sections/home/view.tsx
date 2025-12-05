// sections
import HomeHero from './home-hero';
import HomeHowItWorks from './home-how-it-works';
import HomeBenefits from './home-benefits';
import HomePricing from './home-pricing';
import HomeTestimonials from './home-testimonials';
import HomeFaq from './home-faq';
import HomeFooter from './home-footer';

// ----------------------------------------------------------------------

export default function HomeView() {
  return (
    <>
      <HomeHero />
      <HomeHowItWorks />
      <HomeBenefits />
      <HomePricing />
      <HomeTestimonials />
      <HomeFaq />
      <HomeFooter />
    </>
  );
}

