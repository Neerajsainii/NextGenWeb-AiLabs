import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="section-shell py-10">
        <div className="glass-card grid gap-8 p-8 md:grid-cols-3">
          <div>
            <h3 className="font-heading text-lg">NextGen Web AI Labs</h3>
            <p className="mt-2 text-sm text-textSecondary">
              Engineering the Future, One Pixel at a Time.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Services</h4>
            <p className="mt-2 text-sm text-textSecondary">
              AI Integration, SaaS, Full Stack, Cloud &amp; DevOps
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Company</h4>
            <ul className="mt-2 space-y-1 text-sm text-textSecondary">
              <li>
                <a
                  href="mailto:nextgenwebailabs@gmail.com"
                  className="transition hover:text-accentCyan"
                >
                  nextgenwebailabs@gmail.com
                </a>
              </li>
              <li>
                <Link href="/privacy-policy" className="transition hover:text-accentCyan">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="transition hover:text-accentCyan">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-textSecondary">
          &copy; {new Date().getFullYear()} NextGen Web AI Labs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
