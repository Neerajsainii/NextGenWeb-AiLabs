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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<EmployeeUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "" });

  useEffect(() => {
    const u = getStoredEmployeeUser();
    if (!u) { router.replace("/employee/login"); return; }
    setUser(u);
    setForm({ first_name: u.first_name, last_name: u.last_name });
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await updateMyProfile({ first_name: form.first_name.trim(), last_name: form.last_name.trim() });
      const u = result.user;
      persistEmployeeSession(
        localStorage.getItem("employee_access_token") ?? "",
        localStorage.getItem("employee_refresh_token") ?? "",
        u
      );
      setUser(u);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setBusy(false);
    }
  }

  if (!user) return null;

  return (
    <section className="section-shell pt-36 pb-20">
      <SectionTitle title="Profile" subtitle="Update your personal information" />
      <GlassCard className="mx-auto max-w-lg p-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-300/10 text-xl font-bold text-cyan-200">
            {(user.first_name?.[0] || user.username[0]).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-textPrimary">
              {user.first_name || user.username} {user.last_name}
            </p>
            <p className="text-xs capitalize text-textSecondary">{user.role.replace("_", " ")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <label className="text-xs text-textSecondary">First Name</label>
            <input
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none transition focus:border-cyan-300/60"
              value={form.first_name}
              onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs text-textSecondary">Last Name</label>
            <input
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none transition focus:border-cyan-300/60"
              value={form.last_name}
              onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs text-textSecondary">Username</label>
            <input
              disabled
              value={user.username}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-textSecondary cursor-not-allowed"
            />
            <p className="text-xs text-textSecondary/60">Change username in Settings.</p>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs text-textSecondary">Email</label>
            <input
              disabled
              value={user.email}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-textSecondary cursor-not-allowed"
            />
            <p className="text-xs text-textSecondary/60">Change email in Settings.</p>
          </div>
          <GlowButton type="submit" disabled={busy} className="mt-2 disabled:opacity-70">
            {busy ? "Saving..." : "Save Changes"}
          </GlowButton>
        </form>
      </GlassCard>
    </section>
  );
}
