import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import DashboardPreview from '@/components/landing/DashboardPreview';
import FeatureGrid from '@/components/landing/FeatureGrid';
import StatsBar from '@/components/landing/StatsBar';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

/**
 * LandingPage — The external-facing marketing page for AssetFlow.
 * Composed from modular sections, each powered by the service layer.
 */
export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-[#FAF7F5]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <DashboardPreview />
        <StatsBar />
        <FeatureGrid />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
