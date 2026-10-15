import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import HealthcareCategories from '@/components/home/HealthcareCategories';
import HowItWorks from '@/components/home/HowItWorks';
import AISection from '@/components/home/AISection';
import EmergencySection from '@/components/home/EmergencySection';
import { FAQ, TrustSection } from '@/components/home/TrustAndFaq';
import FeaturedProviders from '@/components/home/FeaturedProviders';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HealthcareCategories />
        <HowItWorks />
        <section id="discover" className="mx-auto max-w-7xl px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-3xl font-extrabold text-deep">Healthcare discovery preview</h2><p className="mt-2 text-sm text-muted">Providers currently listed on MediGuide.</p></div><Button href="/find-care" variant="secondary">Browse all</Button></div>
          <FeaturedProviders />
        </section>
        <AISection />
        <EmergencySection />
        <TrustSection />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
