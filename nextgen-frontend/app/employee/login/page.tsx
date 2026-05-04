"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  EmployeeRole,
  employeeLogin,
  getStoredEmployeeUser,
  persistEmployeeSession,
} from "@/lib/employee-api";

const roleOptions: { label: string; value: EmployeeRole }[] = [
  { label: "Admin", value: "admin" },
  { label: "HR", value: "hr" },
  { label: "Sales", value: "sales" },
  { label: "Project Manager", value: "project_manager" },
  { label: "Developer", value: "developer" },
];

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [blockedError, setBlockedError] = useState(false);
  const [formState, setFormState] = useState({
    identifier: "",
    password: "",
    role: "hr" as EmployeeRole,
  });

  useEffect(() => {
    const current = getStoredEmployeeUser();
    if (current) {
      router.replace("/employee/dashboard");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await employeeLogin({ username: formState.identifier, password: formState.password, role: formState.role });
      persistEmployeeSession(result.access, result.refresh, result.user);
      toast.success("Login successful");
      router.push("/employee/dashboard");
    } catch (error) {
      const apiError =
        (error as { response?: { data?: { error?: string; errors?: Record<string, string> } } })?.response
          ?.data;
      const message =
        apiError?.error ||
        (apiError?.errors ? Object.values(apiError.errors).join(", ") : "Login failed. Verify credentials and selected role.");

      if (message.toLowerCase().includes("blocked")) {
        setBlockedError(true);
      } else {
        setBlockedError(false);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-shell pt-36">
      <SectionTitle
        title="Employee Login"
        subtitle="Secure internal access for admin, HR, sales, project managers, and developers"
      />

      {blockedError && (
        <div className="mx-auto mb-6 max-w-xl rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-center">
          <p className="font-semibold text-red-300">Account Blocked</p>
          <p className="mt-1 text-sm text-red-200/80">
            Your account has been blocked. Please contact HR to resolve this.
          </p>
        </div>
      )}

      <GlassCard className="mx-auto w-full max-w-xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm text-textSecondary" htmlFor="identifier">
              Username or Email
            </label>
            <input
              id="identifier"
              autoComplete="username"
              placeholder="Enter your username or email"
              value={formState.identifier}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, identifier: event.target.value }))
              }
              required
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-textPrimary placeholder-white/30 outline-none transition focus:border-cyan-300/60"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-textSecondary" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formState.password}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, password: event.target.value }))
              }
              required
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-textPrimary outline-none transition focus:border-cyan-300/60"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-textSecondary" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={formState.role}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, role: event.target.value as EmployeeRole }))
              }
              className="rounded-xl border border-white/15 bg-bgSecondary px-4 py-2.5 text-textPrimary outline-none transition focus:border-cyan-300/60"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <GlowButton type="submit" disabled={loading} className="mt-2 w-full disabled:opacity-70">
            {loading ? "Signing in..." : "Sign In"}
          </GlowButton>
        </form>
      </GlassCard>
    </section>
  );
}
