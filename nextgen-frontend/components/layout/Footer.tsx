export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="section-shell py-10">
        <div className="glass-card grid gap-8 p-8 md:grid-cols-3">
          <div>
            <h3 className="font-heading text-lg">NextGen Web & AI Labs</h3>
            <p className="mt-2 text-sm text-textSecondary">
              Engineering the Future, One Pixel at a Time.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Services</h4>
            <p className="mt-2 text-sm text-textSecondary">
              AI Integration, SaaS, Full Stack, Cloud & DevOps
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Company</h4>
            <p className="mt-2 text-sm text-textSecondary">
              Contact: hello@nextgenwebailabs.com
            </p>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-textSecondary">
          Copyright 2025 NextGen Web & AI Labs. Privacy Policy. Terms.
        </p>
      </div>
    </footer>
  );
}
