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

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to VectorCraft ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website thevectorcraft.com and use our services.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
          <p className="mb-4">We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
          <ul className="list-disc ml-6 mb-4">
            <li><strong>Account Information:</strong> Email address, name, and password</li>
            <li><strong>Payment Information:</strong> Processed securely through PayPal (we do not store your payment details)</li>
            <li><strong>Images:</strong> Images you upload for conversion to SVG format</li>
            <li><strong>Usage Data:</strong> Information about how you use our services, including conversion history and analytics</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your image conversions and deliver results</li>
            <li>Process your transactions and manage subscriptions</li>
            <li>Send you technical notices, updates, security alerts, and support messages</li>
            <li>Respond to your comments, questions, and customer service requests</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, prevent, and address technical issues and fraudulent activity</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment processing is handled securely through PayPal, and we do not store your payment card details on our servers.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Image Data and Retention</h2>
          <p className="mb-4">
            Images you upload for conversion are processed using our AI-powered conversion service. Original uploaded images and converted SVG files are stored securely and associated with your account for your convenience. You can delete your conversion history at any time from your account dashboard.
          </p>
          <p className="mb-4">
            We retain your account information and conversion history as long as your account is active or as needed to provide services. If you delete your account, we will delete or anonymize your personal information within 30 days, unless we are required to retain it for legal compliance.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Sharing and Disclosure</h2>
          <p className="mb-4">We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
          <ul className="list-disc ml-6 mb-4">
            <li><strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf (e.g., FAL.ai for image conversion, PayPal for payment processing)</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required to do so by law or in response to valid requests by public authorities</li>
            <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition</li>
            <li><strong>With Your Consent:</strong> We may share information for any other purpose with your consent</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Cookies and Tracking Technologies</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to track activity on our service and store certain information. Cookies are files with small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Your Rights and Choices</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc ml-6 mb-4">
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data</li>
            <li><strong>Object:</strong> Object to processing of your personal data</li>
            <li><strong>Portability:</strong> Request transfer of your data to another service</li>
            <li><strong>Withdraw Consent:</strong> Withdraw your consent at any time where we relied on your consent to process your data</li>
          </ul>
          <p className="mb-4">
            To exercise these rights, please contact us at support@thevectorcraft.com. We will respond to your request within 30 days.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Children's Privacy</h2>
          <p className="mb-4">
            Our service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. International Data Transfers</h2>
          <p className="mb-4">
            Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our service, you consent to this transfer.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Third-Party Links</h2>
          <p className="mb-4">
            Our service may contain links to third-party websites. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">12. Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Continued use of the service after changes constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">13. Contact Us</h2>
          <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at:</p>
          <p className="mb-4">
            <strong>Email:</strong> support@thevectorcraft.com<br />
            <strong>Website:</strong> thevectorcraft.com
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
