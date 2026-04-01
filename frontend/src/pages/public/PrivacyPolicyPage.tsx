import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import rushLogo from "@/assets/rush-logo.svg";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2">
            <img src={rushLogo} alt="Rush Corporation" className="h-8" />
            <span className="font-semibold text-xl">RushCRM</span>
          </Link>
          <Link to="/home">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              RushCRM ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our CRM and business management platform, including any associated services, features, or applications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Account Information:</strong> Name, email address, password, organization name, and profile information.</li>
              <li><strong>Business Data:</strong> CRM data (leads, deals, customers), HR records, inventory data, and other business information you input.</li>
              <li><strong>Communication Data:</strong> Messages, files, and content shared through our platform.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">2.2 Information from Third-Party Services</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you connect third-party services like Google Drive, Google Calendar, OneDrive, or network drives, we may receive:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Basic profile information (name, email) from your Google account</li>
              <li>Access tokens to interact with your connected cloud storage and calendar</li>
              <li>File metadata (names, sizes, modification dates) from connected drives</li>
              <li>Calendar event data (titles, times, attendees) from connected calendars</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">2.3 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Device information (browser type, operating system)</li>
              <li>Usage data (features accessed, time spent, actions taken)</li>
              <li>Log data (IP address, access times, error reports)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide, maintain, and improve our CRM and business management services</li>
              <li>Process transactions and manage your account</li>
              <li>Enable integration with connected services (Google Drive, Google Calendar, OneDrive, etc.)</li>
              <li>Send service-related communications</li>
              <li>Ensure security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Google API Services User Data Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              RushCRM's use and transfer of information received from Google APIs adheres to the{" "}
              <a 
                href="https://developers.google.com/terms/api-services-user-data-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Specifically, we:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Only request access to data necessary for providing our CRM services</li>
              <li>Do not use Google user data for advertising purposes</li>
              <li>Do not sell Google user data to third parties</li>
              <li>Do not use Google user data to develop or improve AI/ML models unrelated to our core service</li>
              <li>Allow users to revoke access at any time through their Google Account settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal information. We may share information only in these circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Within Your Organization:</strong> Data is shared with authorized users in your organization based on role permissions.</li>
              <li><strong>Service Providers:</strong> With trusted third-party providers who assist in operating our platform (hosting, analytics).</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Encryption of data in transit (TLS/SSL) and at rest</li>
              <li>Multi-tenant data isolation with Row Level Security (RLS)</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure token storage for third-party integrations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services. Upon account deletion, we will delete or anonymize your data within 30 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data</li>
              <li>Export your data in a portable format</li>
              <li>Object to or restrict processing</li>
              <li>Revoke consent for connected services</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, contact us at privacy@rushcorporation.com or through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Third-Party Links and Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our platform may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services are not intended for individuals under 16 years of age. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">RushCRM Privacy Team</p>
              <p className="text-muted-foreground">Email: privacy@rushcorporation.com</p>
              <p className="text-muted-foreground">Website: crm.rushcorporation.com</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex justify-center gap-6 mb-4">
            <Link to="/home" className="hover:text-foreground">Home</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
          </div>
          <p>© {new Date().getFullYear()} RushCRM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
