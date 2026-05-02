import type { Metadata } from "next";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/ui/SectionTitle";

export const metadata: Metadata = {
  title: "Privacy Policy | NextGen Web AI Labs",
  description:
    "Learn how NextGen Web AI Labs collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="section-shell pt-36 pb-20">
      <SectionTitle
        title="Privacy Policy"
        subtitle="Last updated: May 2026"
      />

      <GlassCard className="mx-auto max-w-4xl p-8 sm:p-12 space-y-10">

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">1. Introduction</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            NextGen Web AI Labs (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting
            your privacy. This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our website or engage our services.
            Please read this policy carefully. If you disagree with its terms, please
            discontinue use of our site.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">2. Information We Collect</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            We may collect information about you in a variety of ways:
          </p>
          <ul className="list-disc list-inside text-sm text-textSecondary space-y-1 pl-2">
            <li>
              <strong className="text-textPrimary">Contact Information</strong> – name, email address,
              phone number, and message content you provide via our contact form.
            </li>
            <li>
              <strong className="text-textPrimary">Technical Data</strong> – IP address, browser type,
              operating system, referring URLs, and pages visited, collected automatically
              through standard server logs and cookies.
            </li>
            <li>
              <strong className="text-textPrimary">Communications</strong> – records of correspondence
              if you contact us directly.
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-sm text-textSecondary space-y-1 pl-2">
            <li>To respond to your inquiries and provide requested services.</li>
            <li>To improve our website and tailor content to your interests.</li>
            <li>To send transactional emails (project updates, quotes, invoices).</li>
            <li>To comply with legal obligations.</li>
            <li>To detect and prevent fraudulent or unauthorized activity.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">4. Cookies</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            We use cookies and similar tracking technologies to enhance your browsing
            experience. You can instruct your browser to refuse all cookies or to indicate
            when a cookie is being sent. However, some parts of the site may not function
            properly without cookies.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">5. Data Sharing &amp; Third Parties</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            We do not sell, trade, or rent your personal information to third parties. We may
            share data with trusted service providers who assist us in operating our website
            and conducting business, provided they agree to keep this information confidential.
            We may also disclose information when required by law or to protect our rights.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">6. Data Retention</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            We retain your personal data only for as long as necessary to fulfil the purposes
            outlined in this policy, or as required by law. Contact form submissions are
            retained for up to 2 years unless you request earlier deletion.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">7. Security</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            We implement industry-standard security measures including HTTPS encryption,
            JWT-based authentication for internal systems, and regular security audits.
            However, no method of transmission over the internet is 100% secure.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">8. Your Rights</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            Depending on your jurisdiction, you may have rights to access, correct, or delete
            your personal data. To exercise these rights, contact us at{" "}
            <a
              href="mailto:nextgenwebailabs@gmail.com"
              className="text-accentCyan hover:underline"
            >
              nextgenwebailabs@gmail.com
            </a>
            .
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">9. Changes to This Policy</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            We may update this Privacy Policy from time to time. We will notify you of
            significant changes by posting the new policy on this page with an updated date.
            Continued use of our services after changes constitutes acceptance of the revised
            policy.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl text-textPrimary">10. Contact Us</h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            If you have questions about this Privacy Policy, please reach out:
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
