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

  const isSuspended = user?.account_status === "suspend";
  const creatableRoles = useMemo(() => (user ? getCreatableRoles(user.role) : []), [user]);

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
    } catch (error) {
      const apiErr = (error as { response?: { data?: { error?: string } } })?.response?.data;
      toast.error(apiErr?.error ?? "Failed to create employee");
    } finally {
      setBusy(false);
    }
  }

  async function handleRoleUpdate(id: number, role: EmployeeRole) {
    if (isSuspended) { toast.error("Account suspended."); return; }
    try {
      await updateEmployee(id, { role });
      setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, role } : e)));
      toast.success("Role updated");
    } catch { toast.error("Failed to update role"); }
  }

  async function handleStatusUpdate(id: number, account_status: EmployeeAccountStatus) {
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create employee */}
        <GlassCard className="p-6">
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
                <select className="rounded-xl border border-white/15 bg-bgSecondary px-3 py-2.5 text-sm" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as EmployeeRole }))}>
                  {creatableRoles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <select className="rounded-xl border border-white/15 bg-bgSecondary px-3 py-2.5 text-sm" value={form.account_status} onChange={(e) => setForm((p) => ({ ...p, account_status: e.target.value as EmployeeAccountStatus }))}>
                  {employeeStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <GlowButton type="submit" disabled={busy || creatableRoles.length === 0}>{busy ? "Creating..." : "Create Employee"}</GlowButton>
            </fieldset>
          </form>
        </GlassCard>

        {/* Employee list */}
        <GlassCard className="p-6">
          <h3 className="mb-4 font-heading text-lg text-textPrimary">Employee Controls</h3>
          {employees.length === 0 ? (
            <p className="text-sm text-textSecondary">No employees found.</p>
          ) : (
            <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-1">
              {employees.map((emp) => (
                <div key={emp.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-textPrimary">{emp.username}</p>
                  <p className="text-xs text-textSecondary">{emp.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <select
                      className="rounded-lg border border-white/15 bg-bgSecondary px-2 py-1 text-xs"
                      value={emp.role}
                      disabled={isSuspended}
                      onChange={(e) => handleRoleUpdate(emp.id, e.target.value as EmployeeRole)}
                    >
                      {(user.role === "admin" ? ["hr", "sales", "project_manager", "developer"] : ["sales", "project_manager", "developer"]).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <select
                      className="rounded-lg border border-white/15 bg-bgSecondary px-2 py-1 text-xs"
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
          )}
        </GlassCard>
      </div>
    </section>
  );
}
