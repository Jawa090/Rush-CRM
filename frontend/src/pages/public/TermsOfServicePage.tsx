import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import rushLogo from "@/assets/rush-logo.svg";

export default function TermsOfServicePage() {
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
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using RushCRM ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              RushCRM is a multi-tenant CRM and business management platform that provides:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Customer Relationship Management (CRM) tools</li>
              <li>Human Resource Management System (HRMS)</li>
              <li>Inventory management</li>
              <li>Collaboration tools including calendar, file storage, and communication</li>
              <li>Integration with third-party services (Google Drive, Google Calendar, OneDrive, network drives)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Account Registration</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">3.1 Account Creation</h3>
            <p className="text-muted-foreground leading-relaxed">
              To use certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3.2 Organization Accounts</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you create an organization account, you represent that you have authority to bind the organization to these Terms. The organization administrator is responsible for managing user access and permissions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Conduct</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use the Service for any unlawful purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Upload or transmit viruses or malicious code</li>
              <li>Attempt to gain unauthorized access to the Service or other systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Impersonate any person or entity</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Third-Party Integrations</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">5.1 Google Services</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our Service integrates with Google services including Google Drive and Google Calendar. By connecting your Google account, you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Authorize us to access your Google Drive files and Calendar events as permitted by the scopes you approve</li>
              <li>Acknowledge that your use is also subject to Google's Terms of Service</li>
              <li>Can revoke access at any time through your Google Account settings</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">5.2 Other Integrations</h3>
            <p className="text-muted-foreground leading-relaxed">
              When connecting other services (OneDrive, network drives, etc.), you are responsible for complying with those services' terms and ensuring you have proper authorization.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">6.1 Our Intellectual Property</h3>
            <p className="text-muted-foreground leading-relaxed">
              The Service and its original content, features, and functionality are owned by RushCRM and are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">6.2 Your Content</h3>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of content you upload to the Service. By uploading content, you grant us a license to store, process, and display that content as necessary to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Data and Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your use of the Service is also governed by our{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              . By using the Service, you consent to the collection and use of information as described in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Subscription and Payment</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">8.1 Free and Paid Plans</h3>
            <p className="text-muted-foreground leading-relaxed">
              The Service may offer both free and paid subscription plans. Paid subscriptions are billed in advance on a monthly or annual basis.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">8.2 Cancellation</h3>
            <p className="text-muted-foreground leading-relaxed">
              You may cancel your subscription at any time. Upon cancellation, you will retain access until the end of your current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, RUSHCRM SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless RushCRM and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">13. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by updating the "Last updated" date and, where appropriate, by email. Your continued use of the Service after changes constitute acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">14. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">15. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">RushCRM Legal Team</p>
              <p className="text-muted-foreground">Email: legal@rushcorporation.com</p>
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
