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
          <p className="mb-4">
            By accessing and using VectorCraft (the "Service") available at thevectorcraft.com, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
          <p className="mb-4">
            VectorCraft is an AI-powered image conversion service that transforms raster images (JPG, JPEG, PNG) into scalable vector graphics (SVG and EPS formats). The Service includes:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>Automated image-to-vector conversion using artificial intelligence</li>
            <li>Export capabilities in SVG and EPS formats</li>
            <li>Cloud storage of conversion history</li>
            <li>Account management and subscription services</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          <p className="mb-4">
            To use certain features of the Service, you must register for an account. You agree to:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and update your information to keep it accurate and current</li>
            <li>Maintain the security of your password and account</li>
            <li>Accept all responsibility for activity that occurs under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Subscription Plans and Pricing</h2>
          <p className="mb-4">
            VectorCraft offers multiple subscription tiers:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li><strong>Starter Plan:</strong> Monthly or yearly subscription with limited conversions per month</li>
            <li><strong>Professional Plan:</strong> Monthly or yearly subscription with increased conversion limits and priority support</li>
            <li><strong>Lifetime Deal:</strong> One-time payment for unlimited conversions</li>
          </ul>
          <p className="mb-4">
            Pricing and features are subject to change. Changes will not affect existing subscribers until their next renewal. New prices apply only to new subscriptions.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Payment Terms</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>All payments are processed securely through PayPal</li>
            <li>Monthly and yearly subscriptions renew automatically unless cancelled</li>
            <li>Lifetime subscriptions are one-time payments with no recurring fees</li>
            <li>All prices are in USD</li>
            <li>Refunds are handled in accordance with Section 9 below</li>
            <li>You are responsible for any taxes applicable to your purchase</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Conversion Limits and Credits</h2>
          <p className="mb-4">
            Subscription plans include monthly conversion credits that reset based on your billing cycle:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>Starter plans receive a set number of conversions per month</li>
            <li>Professional plans receive increased conversions per month</li>
            <li>Lifetime plan users receive unlimited conversions</li>
            <li>Unused credits do not roll over to the next billing period</li>
            <li>Credits reset on the anniversary of your subscription start date</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Acceptable Use Policy</h2>
          <p className="mb-4">You agree not to:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Upload copyrighted material without proper authorization or licensing</li>
            <li>Use the Service for any illegal purposes or in violation of any laws</li>
            <li>Attempt to reverse engineer, decompile, or hack the Service</li>
            <li>Share your account credentials with others or create multiple accounts</li>
            <li>Upload malicious code, viruses, or any harmful content</li>
            <li>Abuse the Service through excessive API calls or automated requests</li>
            <li>Use the Service to infringe on others' intellectual property rights</li>
            <li>Resell or redistribute converted images created by the Service without proper rights</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Intellectual Property Rights</h2>
          <p className="mb-4">
            <strong>Your Content:</strong> You retain all rights to the original images you upload and the converted vector files generated by the Service. By using the Service, you grant us a limited license to process your images for the purpose of providing the conversion service.
          </p>
          <p className="mb-4">
            <strong>Our Content:</strong> The Service, including its original content, features, and functionality, is owned by VectorCraft and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Cancellations and Refunds</h2>
          <p className="mb-4">
            <strong>Subscription Cancellations:</strong> You may cancel your monthly or yearly subscription at any time. Upon cancellation, you will retain access until the end of your current billing period. No refunds are provided for partial billing periods.
          </p>
          <p className="mb-4">
            <strong>Refund Policy:</strong> Due to the nature of digital services and immediate access provided upon purchase, we generally do not offer refunds. However, we may consider refund requests on a case-by-case basis for:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>Technical issues that prevent use of the Service</li>
            <li>Duplicate charges or billing errors</li>
            <li>Requests made within 7 days of purchase with minimal service usage</li>
          </ul>
          <p className="mb-4">
            Contact support@thevectorcraft.com to request a refund.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Service Availability and Modifications</h2>
          <p className="mb-4">
            We strive to provide consistent service availability but cannot guarantee uninterrupted access. We reserve the right to:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>Modify, suspend, or discontinue the Service at any time</li>
            <li>Impose limits on certain features or restrict access to parts of the Service</li>
            <li>Perform scheduled or emergency maintenance</li>
          </ul>
          <p className="mb-4">
            We will provide reasonable notice for significant changes when possible.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Limitation of Liability</h2>
          <p className="mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, VECTORCRAFT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </p>
          <p className="mb-4">
            The Service is provided "AS IS" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">12. Indemnification</h2>
          <p className="mb-4">
            You agree to indemnify and hold VectorCraft harmless from any claims, damages, losses, liabilities, and expenses (including attorneys' fees) arising from your use of the Service, your violation of these Terms, or your violation of any rights of another party.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">13. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">14. Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which VectorCraft operates, without regard to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">15. Dispute Resolution</h2>
          <p className="mb-4">
            Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with commercial arbitration rules, except where prohibited by law.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">16. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Service after changes constitutes acceptance of the updated Terms.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">17. Severability</h2>
          <p className="mb-4">
            If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">18. Contact Information</h2>
          <p className="mb-4">For questions about these Terms of Service, please contact us at:</p>
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
