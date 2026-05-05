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
import { X } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"create" | "all">("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const canCreate = user?.role === "sales" || user?.role === "admin";
  const isSuspended = user?.is_suspend === true;

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
        estimated_value: form.estimated_value || undefined,
      });
      setForm(emptyLead);
      const d = await fetchLeads();
      setLeads(normalizeLeads(d));
      toast.success("Lead created");
      setActiveTab("all");
    } catch {
      toast.error("Failed to create lead");
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusUpdate(id: string, status: Lead["status"]) {
    if (isSuspended) { toast.error("Account suspended — read-only access."); return; }
    try {
      await updateLead(id, { status });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      toast.success("Lead updated");
      if (selectedLead?.id === id) {
        setSelectedLead(prev => prev ? { ...prev, status } : null);
      }
    } catch {
      toast.error("Failed to update lead");
    }
  }

  const filteredLeads = useMemo(() => {
    if (!user) return leads;
    if (user.role === "project_manager") return leads.filter((l) => l.status === "negotiation");
    return leads;
  }, [leads, user]);

  const inputCls = "rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60 placeholder:text-textSecondary/60";

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

      {/* Tab bar */}
      <div className="mb-6 flex gap-2 border-b border-white/10">
        {(canCreate ? ["create", "all"] as const : ["all"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium transition capitalize ${activeTab === tab
              ? "border-b-2 border-cyan-300/60 text-textPrimary"
              : "text-textSecondary hover:text-textPrimary"
              }`}
          >
            {tab === "create" ? "Create Lead" : `All Leads (${filteredLeads.length})`}
          </button>
        ))}
      </div>

      {/* ── Create Lead tab ────────────────────────────────────────────── */}
      {activeTab === "create" && canCreate && (
        <GlassCard className="mx-auto max-w-lg p-6">
          <h3 className="mb-4 font-heading text-lg text-textPrimary">Create Lead</h3>
          <form onSubmit={handleCreate} className="grid gap-3">
            <fieldset disabled={isSuspended} className="grid gap-3 disabled:opacity-70">
              <input className={inputCls} placeholder="Lead title *" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
              <input className={inputCls} placeholder="Company name *" value={form.company_name} onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))} required />
              <input className={inputCls} placeholder="Contact person *" value={form.contact_name} onChange={(e) => setForm((p) => ({ ...p, contact_name: e.target.value }))} required />
              <input type="email" className={inputCls} placeholder="Contact email *" value={form.contact_email} onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))} required />
              <input className={inputCls} placeholder="Phone (optional)" value={form.contact_phone} onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))} />
              <textarea className={inputCls} placeholder="Requirements" value={form.requirements} onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))} rows={3} />
              <input className={inputCls} placeholder="Estimated value" value={form.estimated_value} onChange={(e) => setForm((p) => ({ ...p, estimated_value: e.target.value }))} />
              <GlowButton type="submit" disabled={busy}>{busy ? "Saving..." : "Create Lead"}</GlowButton>
            </fieldset>
          </form>
        </GlassCard>
      )}

      {/* ── All Leads tab ──────────────────────────────────────────────── */}
      {activeTab === "all" && (
        <>
          {filteredLeads.length === 0 ? (
            <GlassCard className="p-8 text-center text-sm text-textSecondary">No leads found.</GlassCard>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/30 hover:bg-white/[0.08] cursor-pointer flex flex-col gap-3"
                  onClick={() => setSelectedLead(lead)}
                >
                  <div>
                    <p className="font-heading text-base font-semibold text-textPrimary leading-snug">{lead.title}</p>
                    <p className="text-sm text-textSecondary mt-0.5">{lead.company_name}</p>
                  </div>
                  
                  <div className="flex flex-col gap-1 text-xs text-textSecondary bg-white/5 p-3 rounded-lg">
                    <p className="flex items-center gap-2"><span className="text-lg leading-none">👤</span> {lead.contact_name}</p>
                    <p className="flex items-center gap-2"><span className="text-lg leading-none">✉️</span> <span className="truncate">{lead.contact_email}</span></p>
                    {lead.estimated_value && <p className="flex items-center gap-2"><span className="text-lg leading-none">💰</span> ${lead.estimated_value}</p>}
                  </div>

                  <div className="mt-auto pt-3 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                    <select
                      className="w-full rounded-lg border border-white/15 bg-bgSecondary px-2 py-1.5 text-xs text-textPrimary capitalize outline-none cursor-pointer"
                      value={lead.status}
                      disabled={isSuspended}
                      onChange={(e) => handleStatusUpdate(lead.id, e.target.value as Lead["status"])}
                    >
                      {getLeadStatusOptions(user.role, lead.status).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Lead Modal */}
      {selectedLead && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" 
          onClick={() => setSelectedLead(null)}
        >
          <div 
            className="bg-bgSecondary border border-white/10 rounded-2xl w-full max-w-lg p-6 relative overflow-hidden shadow-2xl animate-fade-in" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-textSecondary hover:text-white transition" 
              onClick={() => setSelectedLead(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-textPrimary pr-8 leading-snug">{selectedLead.title}</h2>
            <p className="text-sm font-medium text-cyan-300 mb-5">{selectedLead.company_name}</p>
            
            <div className="space-y-4 text-sm text-textPrimary">
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl">
                <div>
                  <span className="text-textSecondary block text-xs mb-0.5">Contact Person</span>
                  <p>{selectedLead.contact_name}</p>
                </div>
                <div>
                  <span className="text-textSecondary block text-xs mb-0.5">Email</span>
                  <p className="truncate" title={selectedLead.contact_email}>{selectedLead.contact_email}</p>
                </div>
                {selectedLead.contact_phone && (
                  <div>
                    <span className="text-textSecondary block text-xs mb-0.5">Phone</span>
                    <p>{selectedLead.contact_phone}</p>
                  </div>
                )}
                {selectedLead.estimated_value && (
                  <div>
                    <span className="text-textSecondary block text-xs mb-0.5">Estimated Value</span>
                    <p className="font-semibold text-emerald-400">${selectedLead.estimated_value}</p>
                  </div>
                )}
              </div>
              
              {selectedLead.requirements && (
                <div>
                  <span className="text-textSecondary block text-xs mb-1.5">Requirements</span>
                  <p className="bg-white/5 p-4 rounded-xl whitespace-pre-wrap leading-relaxed text-xs">
                    {selectedLead.requirements}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
