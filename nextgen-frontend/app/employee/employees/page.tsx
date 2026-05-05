"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  EmployeeAccountStatus,
  EmployeeRole,
  EmployeeUser,
  clearEmployeeSession,
  createEmployee,
  fetchEmployees,
  getStoredEmployeeUser,
  updateEmployee,
} from "@/lib/employee-api";

const employeeStatuses: EmployeeAccountStatus[] = ["active", "suspend", "block"];

function getCreatableRoles(role: EmployeeRole): EmployeeRole[] {
  if (role === "admin") return ["hr", "sales", "project_manager", "developer"];
  if (role === "hr") return ["sales", "project_manager", "developer"];
  return [];
}

const emptyForm = {
  username: "", email: "", first_name: "", last_name: "",
  password: "", role: "developer" as EmployeeRole, account_status: "active" as EmployeeAccountStatus,
};

export default function EmployeesPage() {
  const router = useRouter();
  const [user, setUser] = useState<EmployeeUser | null>(null);
  const [employees, setEmployees] = useState<EmployeeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeTab, setActiveTab] = useState<"create" | "all">("all");

  const isSuspended = user?.is_suspend === true;
  const creatableRoles = useMemo(() => (user ? getCreatableRoles(user.role) : []), [user]);

  const groupedEmployees = useMemo(() => {
    const groups: Record<string, EmployeeUser[]> = {
      admin: [],
      hr: [],
      sales: [],
      project_manager: [],
      developer: [],
    };
    employees.forEach(emp => {
      if (groups[emp.role]) {
        groups[emp.role].push(emp);
      } else {
        groups[emp.role] = [emp];
      }
    });
    return groups;
  }, [employees]);

  useEffect(() => {
    const u = getStoredEmployeeUser();
    if (!u) { router.replace("/employee/login"); return; }
    if (!["admin", "hr"].includes(u.role)) { router.replace("/employee/dashboard"); return; }
    setUser(u);
    setForm((p) => ({ ...p, role: getCreatableRoles(u.role)[0] ?? "developer" }));
    fetchEmployees()
      .then(setEmployees)
      .catch(() => { clearEmployeeSession(); router.replace("/employee/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSuspended) { toast.error("Account suspended — read-only access."); return; }
    setBusy(true);
    try {
      await createEmployee({
        username: form.username,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
        role: form.role,
        account_status: form.account_status,
      });
      setForm((p) => ({ ...emptyForm, role: p.role }));
      setEmployees(await fetchEmployees());
      toast.success("Employee created");
      setActiveTab("all");
    } catch (error) {
      const apiErr = (error as { response?: { data?: { error?: string } } })?.response?.data;
      toast.error(apiErr?.error ?? "Failed to create employee");
    } finally {
      setBusy(false);
    }
  }

  async function handleRoleUpdate(id: string, role: EmployeeRole) {
    if (isSuspended) { toast.error("Account suspended."); return; }
    try {
      await updateEmployee(id, { role });
      setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, role } : e)));
      toast.success("Role updated");
    } catch { toast.error("Failed to update role"); }
  }

  async function handleStatusUpdate(id: string, account_status: EmployeeAccountStatus) {
    if (isSuspended) { toast.error("Account suspended."); return; }
    try {
      await updateEmployee(id, { account_status });
      setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, account_status } : e)));
      toast.success("Status updated");
    } catch { toast.error("Failed to update status"); }
  }

  if (loading || !user) {
    return (
      <section className="section-shell pt-36">
        <GlassCard className="mx-auto max-w-md p-8 text-center text-textSecondary">Loading employees...</GlassCard>
      </section>
    );
  }

  const roleTypes = ["admin", "hr", "sales", "project_manager", "developer"] as const;

  return (
    <section className="section-shell pt-36 pb-20">
      <SectionTitle
        title="Employees"
        subtitle={user.role === "admin" ? "Create and manage all employee accounts" : "Manage your team members"}
      />

      {isSuspended && (
        <GlassCard className="mb-6 border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          Your account is suspended. Read-only access.
        </GlassCard>
      )}

      {/* Tab bar */}
      <div className="mb-6 flex gap-2 border-b border-white/10">
        {(["create", "all"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium transition ${activeTab === tab
              ? "border-b-2 border-cyan-300/60 text-textPrimary"
              : "text-textSecondary hover:text-textPrimary"
              }`}
          >
            {tab === "create" ? "Create Employee" : `All Employees (${employees.length})`}
          </button>
        ))}
      </div>

      {/* ── Create Employee tab ─────────────────────────────────────────── */}
      {activeTab === "create" && (
        <GlassCard className="mx-auto max-w-lg p-6">
          <h3 className="mb-4 font-heading text-lg text-textPrimary">
            {user.role === "admin" ? "Create HR / Employee" : "Create Employee"}
          </h3>
          <form onSubmit={handleCreate} className="grid gap-3">
            <fieldset disabled={isSuspended} className="grid gap-3 disabled:opacity-70">
              <input className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="Username" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} required />
              <input type="email" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
              <div className="grid grid-cols-2 gap-3">
                <input className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="First name" value={form.first_name} onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))} />
                <input className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="Last name" value={form.last_name} onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))} />
              </div>
              <input type="password" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="Temporary password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
              <div className="grid grid-cols-2 gap-3">
                <select className="rounded-xl border border-white/15 bg-bgSecondary px-3 py-2.5 text-sm text-textPrimary" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as EmployeeRole }))}>
                  {creatableRoles.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                </select>
                <select className="rounded-xl border border-white/15 bg-bgSecondary px-3 py-2.5 text-sm text-textPrimary" value={form.account_status} onChange={(e) => setForm((p) => ({ ...p, account_status: e.target.value as EmployeeAccountStatus }))}>
                  {employeeStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <GlowButton type="submit" disabled={busy || creatableRoles.length === 0}>{busy ? "Creating..." : "Create Employee"}</GlowButton>
            </fieldset>
          </form>
        </GlassCard>
      )}

      {/* ── All Employees tab ───────────────────────────────────────────── */}
      {activeTab === "all" && (
        <>
          {employees.length === 0 ? (
            <GlassCard className="p-8 text-center text-sm text-textSecondary">No employees found.</GlassCard>
          ) : (
            <div className="flex flex-col gap-10">
              {roleTypes.map(role => {
                const group = groupedEmployees[role];
                if (!group || group.length === 0) return null;
                return (
                  <div key={role}>
                    <h3 className="mb-4 font-heading text-lg font-semibold text-textPrimary capitalize border-b border-white/10 pb-2">
                      {role.replace("_", " ")}s
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {group.map((emp) => (
                        <div key={emp.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-3 transition hover:border-cyan-300/30 hover:bg-white/[0.08]">
                          <div>
                            <p className="font-heading text-base font-semibold text-textPrimary leading-snug">{emp.username}</p>
                            <p className="text-xs text-textSecondary mt-1">{emp.email}</p>
                            {(emp.first_name || emp.last_name) && (
                              <p className="text-xs text-textSecondary mt-1">{emp.first_name} {emp.last_name}</p>
                            )}
                          </div>
                          
                          <div className="mt-auto pt-3 border-t border-white/10 flex flex-wrap gap-2">
                            <select
                              className="flex-1 rounded-lg border border-white/15 bg-bgSecondary px-2 py-1.5 text-xs text-textPrimary outline-none cursor-pointer capitalize"
                              value={emp.role}
                              disabled={isSuspended}
                              onChange={(e) => handleRoleUpdate(emp.id, e.target.value as EmployeeRole)}
                            >
                              {(user.role === "admin" ? ["hr", "sales", "project_manager", "developer"] : ["sales", "project_manager", "developer"]).map((r) => (
                                <option key={r} value={r}>{r.replace("_", " ")}</option>
                              ))}
                            </select>
                            <select
                              className="flex-1 rounded-lg border border-white/15 bg-bgSecondary px-2 py-1.5 text-xs text-textPrimary outline-none cursor-pointer capitalize"
                              value={emp.account_status}
                              disabled={isSuspended}
                              onChange={(e) => handleStatusUpdate(emp.id, e.target.value as EmployeeAccountStatus)}
                            >
                              {employeeStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
