"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  EmployeeUser,
  getStoredEmployeeUser,
  persistEmployeeSession,
  updateMyProfile,
} from "@/lib/employee-api";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<EmployeeUser | null>(null);
  const [accountBusy, setAccountBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [accountForm, setAccountForm] = useState({ username: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    const u = getStoredEmployeeUser();
    if (!u) { router.replace("/employee/login"); return; }
    setUser(u);
    setAccountForm({ username: u.username, email: u.email });
  }, [router]);

  async function handleAccountSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAccountBusy(true);
    try {
      const result = await updateMyProfile({
        username: accountForm.username.trim(),
        email: accountForm.email.trim(),
      });
      const u = result.user;
      persistEmployeeSession(
        localStorage.getItem("employee_access_token") ?? "",
        localStorage.getItem("employee_refresh_token") ?? "",
        u
      );
      setUser(u);
      toast.success("Account details updated");
    } catch (error) {
      const apiErr = (error as { response?: { data?: { error?: string; errors?: Record<string, string[]> } } })?.response?.data;
      const msg = apiErr?.error || (apiErr?.errors ? Object.entries(apiErr.errors).map(([k, v]) => `${k}: ${v.join(", ")}`).join(" | ") : "Update failed.");
      toast.error(msg);
    } finally {
      setAccountBusy(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordBusy(true);
    try {
      await updateMyProfile({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      });
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
      toast.success("Password changed successfully");
    } catch (error) {
      const apiErr = (error as { response?: { data?: { error?: string; errors?: Record<string, string[]> } } })?.response?.data;
      const msg = apiErr?.error || (apiErr?.errors ? Object.entries(apiErr.errors).map(([k, v]) => `${k}: ${v.join(", ")}`).join(" | ") : "Password change failed.");
      toast.error(msg);
    } finally {
      setPasswordBusy(false);
    }
  }

  if (!user) return null;

  return (
    <section className="section-shell pt-36 pb-20">
      <SectionTitle title="Settings" subtitle="Manage your account credentials and security" />

      <div className="mx-auto max-w-lg space-y-6">
        {/* Account details */}
        <GlassCard className="p-6">
          <h3 className="mb-4 font-heading text-lg text-textPrimary">Account Details</h3>
          <form onSubmit={handleAccountSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-xs text-textSecondary">Username</label>
              <input
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none transition focus:border-cyan-300/60"
                value={accountForm.username}
                onChange={(e) => setAccountForm((p) => ({ ...p, username: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs text-textSecondary">Email</label>
              <input
                type="email"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none transition focus:border-cyan-300/60"
                value={accountForm.email}
                onChange={(e) => setAccountForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <GlowButton type="submit" disabled={accountBusy} className="disabled:opacity-70">
              {accountBusy ? "Saving..." : "Update Account"}
            </GlowButton>
          </form>
        </GlassCard>

        {/* Change password */}
        <GlassCard className="p-6">
          <h3 className="mb-4 font-heading text-lg text-textPrimary">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-xs text-textSecondary">Current Password</label>
              <input
                type="password"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none transition focus:border-cyan-300/60"
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm((p) => ({ ...p, old_password: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs text-textSecondary">New Password</label>
              <input
                type="password"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none transition focus:border-cyan-300/60"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
                required
                minLength={8}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs text-textSecondary">Confirm New Password</label>
              <input
                type="password"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none transition focus:border-cyan-300/60"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirm_password: e.target.value }))}
                required
              />
            </div>
            <GlowButton type="submit" disabled={passwordBusy} className="disabled:opacity-70">
              {passwordBusy ? "Changing..." : "Change Password"}
            </GlowButton>
          </form>
        </GlassCard>
      </div>
    </section>
  );
}
