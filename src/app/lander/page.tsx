import { Suspense } from "react";
import FAQ from "@/components/sections/faq";
import Features from "@/components/sections/features";
import Footer from "@/components/sections/footer";
import Header from "@/components/sections/header";
import Hero from "@/components/sections/hero";
import HowItWorks from "@/components/sections/how-it-works";
import Pricing from "@/components/sections/pricing";
import Problem from "@/components/sections/problem";
import Solution from "@/components/sections/solution";
import Testimonials from "@/components/sections/testimonials";
import UrgencyBanner from "@/components/sections/urgency-banner";
import { PaymentSuccessBanner } from "@/components/PaymentSuccessBanner";
import { LandingPageWrapper } from "@/components/LandingPageWrapper";

export default function LanderPage() {
  return (
    <LandingPageWrapper>
      <main>
        <Suspense fallback={null}>
          <PaymentSuccessBanner />
        </Suspense>
        <Header />
        <UrgencyBanner />
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <Footer />
      </main>
    </LandingPageWrapper>
  );
}
