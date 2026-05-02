"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  EmployeeUser,
  Lead,
  clearEmployeeSession,
  createLead,
  fetchLeads,
  getStoredEmployeeUser,
  updateLead,
} from "@/lib/employee-api";

const leadStatuses = ["new", "qualified", "negotiation", "won", "lost"] as const;

function normalizeLeads(payload: Awaited<ReturnType<typeof fetchLeads>>): Lead[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray((payload as { results?: Lead[] }).results)) return (payload as { results: Lead[] }).results;
  return [];
}

function getLeadStatusOptions(role: string, current: Lead["status"]): Lead["status"][] {
  if (role === "admin") return [...leadStatuses];
  if (role === "sales") {
    if (current === "new") return ["new", "qualified"];
    if (current === "qualified") return ["qualified", "negotiation"];
    return [current];
  }
  if (role === "project_manager") {
    if (current === "negotiation") return ["negotiation", "won", "lost"];
    return [current];
  }
  return [current];
}

const emptyLead = {
  title: "", company_name: "", contact_name: "", contact_email: "",
  contact_phone: "", requirements: "", estimated_value: "",
};

export default function LeadsPage() {
  const router = useRouter();
  const [user, setUser] = useState<EmployeeUser | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyLead);

  const canCreate = user?.role === "sales" || user?.role === "admin";
  const isSuspended = user?.account_status === "suspend";

  useEffect(() => {
    const u = getStoredEmployeeUser();
    if (!u) { router.replace("/employee/login"); return; }
    if (!["admin", "sales", "project_manager"].includes(u.role)) {
      router.replace("/employee/dashboard"); return;
    }
    setUser(u);
    fetchLeads()
      .then((d) => setLeads(normalizeLeads(d)))
      .catch(() => { clearEmployeeSession(); router.replace("/employee/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSuspended) { toast.error("Account suspended — read-only access."); return; }
    setBusy(true);
    try {
      await createLead({
        title: form.title,
        company_name: form.company_name,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        requirements: form.requirements,
        estimated_value: form.estimated_value ? Number(form.estimated_value) : undefined,
      });
      setForm(emptyLead);
      const d = await fetchLeads();
      setLeads(normalizeLeads(d));
      toast.success("Lead created");
    } catch {
      toast.error("Failed to create lead");
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusUpdate(id: number, status: Lead["status"]) {
    if (isSuspended) { toast.error("Account suspended — read-only access."); return; }
    try {
      await updateLead(id, { status });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      toast.success("Lead updated");
    } catch {
      toast.error("Failed to update lead");
    }
  }

  const filteredLeads = useMemo(() => {
    if (!user) return leads;
    if (user.role === "project_manager") return leads.filter((l) => l.status === "negotiation");
    return leads;
  }, [leads, user]);

  if (loading || !user) {
    return (
      <section className="section-shell pt-36">
        <GlassCard className="mx-auto max-w-md p-8 text-center text-textSecondary">Loading leads...</GlassCard>
      </section>
    );
  }

  return (
    <section className="section-shell pt-36 pb-20">
      <SectionTitle
        title="Leads"
        subtitle={user.role === "project_manager" ? "Negotiation stage leads assigned to you" : "Manage and track your sales pipeline"}
      />

      {isSuspended && (
        <GlassCard className="mb-6 border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          Your account is suspended. Read-only access.
        </GlassCard>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {canCreate && (
          <GlassCard className="p-6">
            <h3 className="mb-4 font-heading text-lg text-textPrimary">Create Lead</h3>
            <form onSubmit={handleCreate} className="grid gap-3">
              <fieldset disabled={isSuspended} className="grid gap-3 disabled:opacity-70">
                <input className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="Lead title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
                <input className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="Company name" value={form.company_name} onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))} required />
                <input className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="Contact person" value={form.contact_name} onChange={(e) => setForm((p) => ({ ...p, contact_name: e.target.value }))} required />
                <input type="email" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="Contact email" value={form.contact_email} onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))} required />
                <input className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="Phone (optional)" value={form.contact_phone} onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))} />
                <textarea className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="Requirements" value={form.requirements} onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))} rows={3} />
                <input className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="Estimated value" value={form.estimated_value} onChange={(e) => setForm((p) => ({ ...p, estimated_value: e.target.value }))} />
                <GlowButton type="submit" disabled={busy}>{busy ? "Saving..." : "Create Lead"}</GlowButton>
              </fieldset>
            </form>
          </GlassCard>
        )}

        <GlassCard className="p-6">
          <h3 className="mb-4 font-heading text-lg text-textPrimary">
            {user.role === "project_manager" ? "Negotiation Leads" : "All Leads"}
          </h3>
          {filteredLeads.length === 0 ? (
            <p className="text-sm text-textSecondary">No leads found.</p>
          ) : (
            <div className="grid gap-3">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-textPrimary">{lead.company_name}</p>
                  <p className="text-sm text-textSecondary">{lead.title}</p>
                  <p className="mt-1 text-xs text-textSecondary/60">Owner: {lead.owner_username}</p>
                  <select
                    className="mt-2 rounded-lg border border-white/15 bg-bgSecondary px-2 py-1 text-xs"
                    value={lead.status}
                    disabled={isSuspended}
                    onChange={(e) => handleStatusUpdate(lead.id, e.target.value as Lead["status"])}
                  >
                    {getLeadStatusOptions(user.role, lead.status).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </section>
  );
}
