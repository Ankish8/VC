import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import UrgencyBanner from "@/components/sections/urgency-banner";

export default function PrivacyPolicy() {
  return (
    <main>
      <Header />
      <UrgencyBanner />
      <div className="max-w-4xl mx-auto px-4 py-20 mt-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Email address</li>
            <li>Payment information (processed securely through PayPal)</li>
            <li>Images you upload for conversion</li>
            <li>Usage data and analytics</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Provide and maintain our services</li>
            <li>Process your transactions</li>
            <li>Send you technical notices and support messages</li>
            <li>Improve our services</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Security</h2>
          <p className="mb-4">We implement appropriate technical and organizational measures to protect your personal information. All payment processing is handled securely through PayPal, and we do not store your payment details.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Retention</h2>
          <p className="mb-4">Uploaded images are automatically deleted from our servers after processing. Account information is retained as long as your account is active or as needed to provide services.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Contact Us</h2>
          <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at:</p>
          <p className="mb-4">Email: support@thevectorcraft.com</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}