"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  EmployeeUser,
  clearEmployeeSession,
  fetchDashboard,
  getStoredEmployeeUser,
} from "@/lib/employee-api";

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<EmployeeUser | null>(null);
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const isSuspended = user?.is_suspend === true;

  const metricsList = useMemo(
    () => Object.entries(metrics).map(([key, value]) => ({ label: key.replaceAll("_", " "), value })),
    [metrics]
  );

  useEffect(() => {
    const currentUser = getStoredEmployeeUser();
    if (!currentUser) { router.replace("/employee/login"); return; }
    setUser(currentUser);
    fetchDashboard()
      .then((d) => setMetrics(d.metrics || {}))
      .catch(() => {
        clearEmployeeSession();
        toast.error("Session expired. Please sign in again.");
        router.replace("/employee/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !user) {
    return (
      <section className="section-shell pt-36">
        <GlassCard className="mx-auto max-w-md p-8 text-center text-textSecondary">
          Loading dashboard...
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="section-shell pt-32 pb-20">
      <SectionTitle
        title="Dashboard"
        subtitle={`Welcome back, ${user.first_name || user.username} · ${user.role.replace("_", " ")}`}
      />

      {isSuspended && (
        <GlassCard className="mb-6 border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          Your account is suspended. You have read-only access. Contact HR.
        </GlassCard>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricsList.length > 0 ? (
          metricsList.map((m) => (
            <GlassCard key={m.label} className="p-5">
              <p className="text-xs uppercase tracking-wider text-textSecondary">{m.label}</p>
              <p className="mt-2 text-2xl font-semibold text-textPrimary">{m.value}</p>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="p-5 text-textSecondary">No metrics available</GlassCard>
        )}
      </div>
    </section>
  );
}
