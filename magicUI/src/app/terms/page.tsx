import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import UrgencyBanner from "@/components/sections/urgency-banner";

export default function TermsOfService() {
  return (
    <main>
      <Header />
      <UrgencyBanner />
      <div className="max-w-4xl mx-auto px-4 py-20 mt-16">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">By accessing and using VectorCraft, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use License</h2>
          <p className="mb-4">Upon purchasing a license, you are granted:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>The right to use VectorCraft for personal or commercial projects</li>
            <li>The ability to convert images according to your plan limits</li>
            <li>Access to export vectors in SVG and EPS formats</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Service Description</h2>
          <p className="mb-4">VectorCraft is an AI-powered vector conversion service that:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Converts JPG and JPEG images to SVG and EPS vector formats</li>
            <li>Provides automatic conversion without manual input required</li>
            <li>Delivers results typically within 30 seconds</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Payment Terms</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>All payments are processed securely through PayPal</li>
            <li>Monthly subscriptions renew automatically unless cancelled</li>
            <li>Lifetime Deal is a one-time payment with no recurring fees</li>
            <li>No refunds are provided for unused conversions</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Acceptable Use</h2>
          <p className="mb-4">You agree not to:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Upload copyrighted material without permission</li>
            <li>Use the service for illegal purposes</li>
            <li>Attempt to reverse engineer or hack the service</li>
            <li>Share your account credentials with others</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
          <p className="mb-4">You retain all rights to your original images and converted vectors. VectorCraft does not claim ownership of your content.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
          <p className="mb-4">VectorCraft is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of our service.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to Terms</h2>
          <p className="mb-4">We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of updated terms.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Information</h2>
          <p className="mb-4">For questions about these Terms of Service, contact us at:</p>
          <p className="mb-4">Email: support@thevectorcraft.com</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}