import type { Metadata } from "next";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/ui/SectionTitle";

export const metadata: Metadata = {
  title: "Terms of Service | NextGen Web AI Labs",
  description:
    "Read the Terms of Service governing your use of NextGen Web AI Labs services and website.",
};

export default function TermsOfServicePage() {
  return (
    <section className="section-shell pt-36 pb-20">
      <SectionTitle
        title="Terms of Service"
        subtitle="Last updated: May 2026"
      />

      <GlassCard className="mx-auto max-w-4xl p-8 sm:p-12 space-y-10">

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">1. Acceptance of Terms</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            By accessing or using the NextGen Web AI Labs website or services, you agree to be
            bound by these Terms of Service and our Privacy Policy. If you do not agree to
            these terms, please do not use our services.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">2. Services</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            NextGen Web AI Labs provides software development, AI integration, cloud-native
            engineering, SaaS development, and related consulting services. The specific scope
            of services for each engagement is defined in a separate Statement of Work (SOW)
            or project agreement.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">3. Intellectual Property</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            Unless otherwise agreed in writing, all work product, code, designs, and
            deliverables created by NextGen Web AI Labs under a client engagement are owned
            by the client upon full payment. Pre-existing intellectual property, internal
            tools, and open-source components remain the property of their respective owners.
          </p>
          <p className="text-sm leading-relaxed text-textSecondary">
            All content on this website — including text, graphics, and branding — is the
            property of NextGen Web AI Labs and may not be reproduced without written
            permission.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">4. Client Responsibilities</h2>
          <ul className="list-disc list-inside text-sm text-textSecondary space-y-1 pl-2">
            <li>Provide accurate project requirements and timely feedback.</li>
            <li>Ensure you have rights to any assets, content, or code you supply to us.</li>
            <li>Make agreed payments on the schedules specified in the contract.</li>
            <li>Keep login credentials and access tokens confidential.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">5. Payment &amp; Cancellation</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            Payment terms are as specified in individual project agreements. Invoices are due
            within 14 days of issue unless otherwise agreed. Late payments may incur a
            1.5% monthly interest charge. Cancellations must be communicated in writing;
            work completed up to the cancellation date is billable.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">6. Limitation of Liability</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            To the maximum extent permitted by law, NextGen Web AI Labs shall not be liable
            for indirect, incidental, special, consequential, or punitive damages arising out
            of your use of our services. Our total liability for any claim shall not exceed
            the total fees paid to us in the three months preceding the claim.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">7. Confidentiality</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            Both parties agree to keep confidential any proprietary or sensitive information
            shared during the engagement. This obligation survives termination of the
            agreement for a period of two years.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">8. Prohibited Use</h2>
          <ul className="list-disc list-inside text-sm text-textSecondary space-y-1 pl-2">
            <li>Using our website for unlawful purposes or in violation of any regulations.</li>
            <li>Attempting to gain unauthorized access to our systems or other users' data.</li>
            <li>Distributing malware, spam, or other harmful content through our platform.</li>
            <li>Scraping or harvesting data from our website without prior written consent.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">9. Governing Law</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            These Terms shall be governed by and construed in accordance with applicable law.
            Any disputes arising from these Terms or our services shall be resolved through
            good-faith negotiation, followed by mediation or binding arbitration if necessary.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">10. Modifications</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            We reserve the right to modify these Terms at any time. Changes will be posted on
            this page with an updated date. Continued use of our services following changes
            constitutes your acceptance of the revised Terms.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">11. Contact</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            For questions about these Terms, contact us at:
          </p>
          <address className="not-italic text-sm text-textSecondary space-y-1">
            <p>NextGen Web AI Labs</p>
            <p>
              Email:{" "}
              <a
                href="mailto:nextgenwebailabs@gmail.com"
                className="text-accentCyan hover:underline"
              >
                nextgenwebailabs@gmail.com
              </a>
            </p>
          </address>
        </div>

      </GlassCard>
    </section>
  );
}
