"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, User, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  EmployeeUser,
  clearEmployeeSession,
  employeeLogout,
  getStoredEmployeeUser,
} from "@/lib/employee-api";

const publicLinks = [
  { href: "/#about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/#projects", label: "Projects" },
  { href: "/#contact", label: "Contact" },
];

function getEmployeeNavLinks(role: string) {
  const links: { href: string; label: string }[] = [
    { href: "/employee/dashboard", label: "Dashboard" },
  ];
  if (["admin", "sales", "project_manager"].includes(role))
    links.push({ href: "/employee/leads", label: "Leads" });
  if (["admin", "project_manager"].includes(role))
    links.push({ href: "/employee/projects", label: "Projects" });
  if (["admin", "developer"].includes(role))
    links.push({ href: "/employee/tasks", label: "Tasks" });
  if (["admin", "hr"].includes(role))
    links.push({ href: "/employee/employees", label: "Employees" });
  return links;
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [employeeUser, setEmployeeUser] = useState<EmployeeUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isEmployeeRoute =
    pathname.startsWith("/employee") && pathname !== "/employee/login";

  useEffect(() => {
    setEmployeeUser(getStoredEmployeeUser());
  }, [pathname]);

  async function handleLogout() {
    try {
      await employeeLogout();
    } catch {
      // no-op
    } finally {
      clearEmployeeSession();
      setEmployeeUser(null);
      router.replace("/employee/login");
    }
  }

  const close = () => setIsOpen(false);
  const navLinks = employeeUser ? getEmployeeNavLinks(employeeUser.role) : [];

  return (
    <header className="fixed left-0 top-4 z-40 w-full px-4 sm:px-8">
      <GlassCard className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link
            href={isEmployeeRoute && employeeUser ? "/employee/dashboard" : "/"}
            className="font-heading text-xs font-semibold tracking-wide sm:text-base"
          >
            NextGen Web AI Labs
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="rounded-md p-2 text-textPrimary sm:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Desktop center nav */}
          {isEmployeeRoute && employeeUser ? (
            <nav className="hidden items-center gap-5 text-sm text-textSecondary sm:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition hover:text-accentCyan ${
                    pathname === link.href ? "text-textPrimary" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : (
            <nav className="hidden items-center gap-6 text-sm text-textSecondary sm:flex">
              {publicLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-accentCyan"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Desktop right side */}
          {isEmployeeRoute && employeeUser ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="rounded bg-white/10 px-2 py-0.5 text-xs capitalize text-textSecondary">
                {employeeUser.role.replace("_", " ")}
              </span>
              <Link
                href="/employee/profile"
                title="Profile"
                className="rounded-md p-1.5 text-textSecondary transition hover:text-accentCyan"
              >
                <User className="h-4 w-4" />
              </Link>
              <Link
                href="/employee/settings"
                title="Settings"
                className="rounded-md p-1.5 text-textSecondary transition hover:text-accentCyan"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-full border border-cyan-300/40 px-3 py-1.5 text-xs font-semibold text-textPrimary transition hover:shadow-glow"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-3 sm:flex">
              {employeeUser ? (
                <Link
                  href="/employee/dashboard"
                  className="flex items-center gap-1.5 rounded-full border border-cyan-300/50 bg-cyan-300/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-300/20"
                >
                  My Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    href="/employee/login"
                    className="text-sm text-textSecondary transition hover:text-accentCyan"
                  >
                    Employee Login
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-full border border-cyan-300/40 px-4 py-1.5 text-xs font-semibold text-textPrimary transition hover:shadow-glow"
                  >
                    Let&apos;s Talk
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {isOpen ? (
          <nav className="mt-3 grid gap-2 border-t border-white/10 pt-3 sm:hidden">
            {isEmployeeRoute && employeeUser ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className="rounded-md px-2 py-2 text-sm text-textSecondary transition hover:bg-white/5 hover:text-accentCyan"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/employee/profile"
                  onClick={close}
                  className="rounded-md px-2 py-2 text-sm text-textSecondary transition hover:bg-white/5 hover:text-accentCyan"
                >
                  Profile
                </Link>
                <Link
                  href="/employee/settings"
                  onClick={close}
                  className="rounded-md px-2 py-2 text-sm text-textSecondary transition hover:bg-white/5 hover:text-accentCyan"
                >
                  Settings
                </Link>
                <p className="px-2 py-1 text-xs text-textSecondary/60">
                  {employeeUser.username} · {employeeUser.role.replace("_", " ")}
                </p>
                <button
                  onClick={() => { close(); void handleLogout(); }}
                  className="rounded-md px-2 py-2 text-left text-sm text-textSecondary transition hover:bg-white/5 hover:text-red-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {publicLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className="rounded-md px-2 py-2 text-sm text-textSecondary transition hover:bg-white/5 hover:text-accentCyan"
                  >
                    {link.label}
                  </a>
                ))}
                {employeeUser ? (
                  <Link
                    href="/employee/dashboard"
                    onClick={close}
                    className="rounded-md px-2 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-white/5"
                  >
                    My Dashboard →
                  </Link>
                ) : (
                  <Link
                    href="/employee/login"
                    onClick={close}
                    className="rounded-md px-2 py-2 text-sm text-textSecondary transition hover:bg-white/5 hover:text-accentCyan"
                  >
                    Employee Login
                  </Link>
                )}
                <Link
                  href="/contact"
                  onClick={close}
                  className="mt-1 rounded-md border border-cyan-300/40 px-3 py-2 text-center text-sm font-semibold text-textPrimary"
                >
                  Let&apos;s Talk
                </Link>
              </>
            )}
          </nav>
        ) : null}
      </GlassCard>
    </header>
  );
}
