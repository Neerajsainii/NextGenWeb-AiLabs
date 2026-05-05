"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { X } from "lucide-react";
import {
  EmployeeUser,
  WorkflowProject,
  clearEmployeeSession,
  createProject,
  fetchProjects,
  getStoredEmployeeUser,
  updateProject,
} from "@/lib/employee-api";

// ─── constants ────────────────────────────────────────────────────────────────
const PROJECT_STATUSES: WorkflowProject["status"][] = [
  "planning",
  "active",
  "on_hold",
  "completed",
  "cancelled",
];

const STATUS_LABELS: Record<WorkflowProject["status"], string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<WorkflowProject["status"], string> = {
  planning: "bg-blue-500/20 text-blue-300 border-blue-400/30",
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  on_hold: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  completed: "bg-purple-500/20 text-purple-300 border-purple-400/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-400/30",
};

const emptyProjectForm = {
  name: "",
  description: "",
  status: "planning" as WorkflowProject["status"],
  start_date: "",
  end_date: "",
};

// ─── helpers ──────────────────────────────────────────────────────────────────
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs text-textSecondary">
        <span>Progress</span>
        <span className="font-medium text-textPrimary">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  editable,
  onStatusChange,
}: {
  status: WorkflowProject["status"];
  editable: boolean;
  onStatusChange?: (s: WorkflowProject["status"]) => void;
}) {
  const cls = `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`;
  if (!editable) return <span className={cls}>{STATUS_LABELS[status]}</span>;

  return (
    <select
      className={`cursor-pointer rounded-full border px-2 py-0.5 text-xs font-medium outline-none ${STATUS_COLORS[status]} bg-transparent`}
      value={status}
      onChange={(e) => onStatusChange?.(e.target.value as WorkflowProject["status"])}
    >
      {PROJECT_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-bgSecondary text-textPrimary">
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}

function ProjectCard({
  project,
  isSuspended,
  onStatusChange,
  onProjectClick,
}: {
  project: WorkflowProject;
  isSuspended: boolean;
  onStatusChange: (id: string, status: WorkflowProject["status"]) => void;
  onProjectClick?: (project: WorkflowProject) => void;
}) {
  return (
    <div 
      className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/30 hover:bg-white/[0.08] cursor-pointer"
      onClick={() => onProjectClick?.(project)}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-heading text-base font-semibold text-textPrimary leading-snug">
          {project.name}
        </p>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <StatusBadge
            status={project.status}
            editable={!isSuspended}
            onStatusChange={(s) => onStatusChange(project.id, s)}
          />
        </div>
      </div>

      {project.description && (
        <p className="mt-2 text-xs text-textSecondary line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      <div className="mt-3 flex flex-col gap-1.5 text-xs">
        {project.source_lead_title && (
          <div className="flex items-center justify-between gap-2">
            <span className="shrink-0 text-textSecondary">📋 Lead</span>
            <span className="text-right font-medium text-textPrimary break-all">{project.source_lead_title}</span>
          </div>
        )}
        {project.sales_owner_username && (
          <div className="flex items-center justify-between gap-2">
            <span className="shrink-0 text-textSecondary">💼 Sales owner</span>
            <span className="text-right font-medium text-textPrimary break-all">{project.sales_owner_username}</span>
          </div>
        )}
        {project.project_manager_username && (
          <div className="flex items-center justify-between gap-2">
            <span className="shrink-0 text-textSecondary">🧑‍💼 Project manager</span>
            <span className="text-right font-medium text-textPrimary break-all">{project.project_manager_username}</span>
          </div>
        )}
        {(project.start_date || project.end_date) && (
          <div className="flex items-center justify-between gap-2">
            <span className="shrink-0 text-textSecondary">📅 Timeline</span>
            <span className="text-right text-textPrimary">
              {project.start_date ?? "—"} → {project.end_date ?? "—"}
            </span>
          </div>
        )}
      </div>

      <ProgressBar value={project.progress_percent} />
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<EmployeeUser | null>(null);
  const [projects, setProjects] = useState<WorkflowProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [activeTab, setActiveTab] = useState<"create" | "all">("all");
  const [selectedProject, setSelectedProject] = useState<WorkflowProject | null>(null);

  const isAdmin = user?.role === "admin";
  const isSuspended = user?.is_suspend === true;

  useEffect(() => {
    const u = getStoredEmployeeUser();
    if (!u) { router.replace("/employee/login"); return; }
    if (!["admin", "project_manager"].includes(u.role)) { router.replace("/employee/dashboard"); return; }
    setUser(u);
    fetchProjects()
      .then((p) => setProjects(p))
      .catch(() => { clearEmployeeSession(); router.replace("/employee/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCreateProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSuspended) { toast.error("Account suspended — read-only access."); return; }
    setBusy(true);
    try {
      await createProject({
        name: projectForm.name,
        description: projectForm.description,
        status: projectForm.status,
        start_date: projectForm.start_date || undefined,
        end_date: projectForm.end_date || undefined,
      });
      setProjectForm(emptyProjectForm);
      setProjects(await fetchProjects());
      toast.success("Project created");
      setActiveTab("all");
    } catch { toast.error("Failed to create project"); }
    finally { setBusy(false); }
  }

  async function handleStatusChange(projectId: string, status: WorkflowProject["status"]) {
    if (isSuspended) { toast.error("Account suspended — read-only access."); return; }
    try {
      await updateProject(projectId, { status });
      setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, status } : p));
      toast.success("Status updated");
    } catch { toast.error("Failed to update status"); }
  }

  const inputCls = "rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60 placeholder:text-textSecondary/60";
  const selectCls = "rounded-xl border border-white/15 bg-bgSecondary px-4 py-2.5 text-sm text-textPrimary";

  if (loading || !user) {
    return (
      <section className="section-shell pt-36">
        <GlassCard className="mx-auto max-w-md p-8 text-center text-textSecondary">Loading projects...</GlassCard>
      </section>
    );
  }

  return (
    <section className="section-shell pt-36 pb-20">
      <SectionTitle title="Projects" subtitle={isAdmin ? "Manage and create projects" : "Your assigned projects"} />

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
            className={`px-5 py-2.5 text-sm font-medium capitalize transition ${activeTab === tab
              ? "border-b-2 border-cyan-300/60 text-textPrimary"
              : "text-textSecondary hover:text-textPrimary"
              }`}
          >
            {tab === "create" ? "Create Project" : `All Projects (${projects.length})`}
          </button>
        ))}
      </div>

      {/* ── Create Project tab ─────────────────────────────────────────── */}
      {activeTab === "create" && (
        <GlassCard className="mx-auto max-w-lg p-6">
          <h3 className="mb-1 font-heading text-lg font-semibold text-textPrimary">New Project</h3>
          {isAdmin && (
            <p className="mb-4 text-xs text-textSecondary">You will be set as sales owner &amp; project manager.</p>
          )}
          <form onSubmit={handleCreateProject} className="grid gap-3">
            <fieldset disabled={isSuspended} className="grid gap-3 disabled:opacity-70">
              <input
                id="project-name"
                className={inputCls}
                placeholder="Project name *"
                value={projectForm.name}
                onChange={(e) => setProjectForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <textarea
                id="project-desc"
                className={inputCls}
                placeholder="Description"
                rows={3}
                value={projectForm.description}
                onChange={(e) => setProjectForm((p) => ({ ...p, description: e.target.value }))}
              />
              <select
                id="project-status"
                className={selectCls}
                value={projectForm.status}
                onChange={(e) => setProjectForm((p) => ({ ...p, status: e.target.value as WorkflowProject["status"] }))}
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label className="text-xs text-textSecondary">Start date</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={projectForm.start_date}
                    onChange={(e) => setProjectForm((p) => ({ ...p, start_date: e.target.value }))}
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs text-textSecondary">End date</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={projectForm.end_date}
                    onChange={(e) => setProjectForm((p) => ({ ...p, end_date: e.target.value }))}
                  />
                </div>
              </div>
              <GlowButton type="submit" disabled={busy} id="create-project-btn">
                {busy ? "Creating..." : "Create Project"}
              </GlowButton>
            </fieldset>
          </form>
        </GlassCard>
      )}

      {/* ── All Projects tab ───────────────────────────────────────────── */}
      {activeTab === "all" && (
        <>
          {projects.length === 0 ? (
            <GlassCard className="p-8 text-center text-sm text-textSecondary">No projects yet.</GlassCard>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  isSuspended={isSuspended}
                  onStatusChange={handleStatusChange}
                  onProjectClick={setSelectedProject}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Project Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" 
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="bg-bgSecondary border border-white/10 rounded-2xl w-full max-w-lg p-6 relative overflow-hidden shadow-2xl animate-fade-in" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-textSecondary hover:text-white transition" 
              onClick={() => setSelectedProject(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-textPrimary pr-8 mb-4 leading-snug">{selectedProject.name}</h2>
            
            <div className="space-y-4 text-sm text-textPrimary">
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl">
                <div>
                  <span className="text-textSecondary block text-xs mb-0.5">Project Manager</span>
                  <p>{selectedProject.project_manager_username || "Unassigned"}</p>
                </div>
                <div>
                  <span className="text-textSecondary block text-xs mb-0.5">Sales Owner</span>
                  <p>{selectedProject.sales_owner_username || "Unassigned"}</p>
                </div>
                {(selectedProject.start_date || selectedProject.end_date) && (
                  <div className="col-span-2">
                    <span className="text-textSecondary block text-xs mb-0.5">Timeline</span>
                    <p>{selectedProject.start_date ?? "—"} → {selectedProject.end_date ?? "—"}</p>
                  </div>
                )}
                {selectedProject.source_lead_title && (
                  <div className="col-span-2">
                    <span className="text-textSecondary block text-xs mb-0.5">Source Lead</span>
                    <p>{selectedProject.source_lead_title}</p>
                  </div>
                )}
              </div>
              
              {selectedProject.description && (
                <div>
                  <span className="text-textSecondary block text-xs mb-1.5">Description</span>
                  <p className="bg-white/5 p-4 rounded-xl whitespace-pre-wrap leading-relaxed text-xs">
                    {selectedProject.description}
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
