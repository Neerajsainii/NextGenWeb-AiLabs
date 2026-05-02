"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  EmployeeUser,
  Task,
  WorkflowProject,
  clearEmployeeSession,
  createProject,
  createTask,
  fetchDeveloperDirectory,
  fetchProjects,
  fetchTasks,
  getStoredEmployeeUser,
  updateTask,
} from "@/lib/employee-api";

const taskStatuses = ["todo", "in_progress", "done"] as const;

const emptyProject = { name: "", description: "", status: "planning" as WorkflowProject["status"], start_date: "", end_date: "" };
const emptyTask = { project: "", title: "", description: "", assigned_to: "", priority: "medium" as Task["priority"], due_date: "" };

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<EmployeeUser | null>(null);
  const [projects, setProjects] = useState<WorkflowProject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [developers, setDevelopers] = useState<EmployeeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [activeTab, setActiveTab] = useState<"projects" | "tasks">("projects");

  const isSuspended = user?.is_suspend === true;

  useEffect(() => {
    const u = getStoredEmployeeUser();
    if (!u) { router.replace("/employee/login"); return; }
    if (!["admin", "project_manager"].includes(u.role)) { router.replace("/employee/dashboard"); return; }
    setUser(u);
    Promise.all([fetchProjects(), fetchTasks(), fetchDeveloperDirectory()])
      .then(([p, t, d]) => { setProjects(p); setTasks(t); setDevelopers(d.results); })
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
      setProjectForm(emptyProject);
      setProjects(await fetchProjects());
      toast.success("Project created");
    } catch { toast.error("Failed to create project"); }
    finally { setBusy(false); }
  }

  async function handleCreateTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSuspended) { toast.error("Account suspended — read-only access."); return; }
    setBusy(true);
    try {
      await createTask({
        project: Number(taskForm.project),
        title: taskForm.title,
        description: taskForm.description,
        assigned_to: taskForm.assigned_to ? Number(taskForm.assigned_to) : undefined,
        priority: taskForm.priority,
        due_date: taskForm.due_date || undefined,
      });
      setTaskForm(emptyTask);
      setTasks(await fetchTasks());
      toast.success("Task created");
    } catch { toast.error("Failed to create task"); }
    finally { setBusy(false); }
  }

  async function handleTaskUpdate(taskId: number, patch: Partial<Task>) {
    if (isSuspended) { toast.error("Account suspended — read-only access."); return; }
    try {
      await updateTask(taskId, patch);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t)));
      toast.success("Task updated");
    } catch { toast.error("Failed to update task"); }
  }

  const projectOptions = useMemo(() => projects.map((p) => ({ id: p.id, name: p.name })), [projects]);

  if (loading || !user) {
    return (
      <section className="section-shell pt-36">
        <GlassCard className="mx-auto max-w-md p-8 text-center text-textSecondary">Loading projects...</GlassCard>
      </section>
    );
  }

  return (
    <section className="section-shell pt-36 pb-20">
      <SectionTitle title="Projects" subtitle="Manage projects and their tasks" />

      {isSuspended && (
        <GlassCard className="mb-6 border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          Your account is suspended. Read-only access.
        </GlassCard>
      )}

      {/* Tab bar */}
      <div className="mb-6 flex gap-2 border-b border-white/10">
        {(["projects", "tasks"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? "border-b-2 border-cyan-300/60 text-textPrimary"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "projects" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create project */}
          <GlassCard className="p-6">
            <h3 className="mb-4 font-heading text-lg text-textPrimary">Create Project</h3>
            <form onSubmit={handleCreateProject} className="grid gap-3">
              <fieldset disabled={isSuspended} className="grid gap-3 disabled:opacity-70">
                <input className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="Project name" value={projectForm.name} onChange={(e) => setProjectForm((p) => ({ ...p, name: e.target.value }))} required />
                <textarea className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="Description" rows={3} value={projectForm.description} onChange={(e) => setProjectForm((p) => ({ ...p, description: e.target.value }))} />
                <select className="rounded-xl border border-white/15 bg-bgSecondary px-4 py-2.5 text-sm" value={projectForm.status} onChange={(e) => setProjectForm((p) => ({ ...p, status: e.target.value as WorkflowProject["status"] }))}>
                  {["planning", "active", "on_hold", "completed", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1"><label className="text-xs text-textSecondary">Start date</label><input type="date" className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-cyan-300/60" value={projectForm.start_date} onChange={(e) => setProjectForm((p) => ({ ...p, start_date: e.target.value }))} /></div>
                  <div className="grid gap-1"><label className="text-xs text-textSecondary">End date</label><input type="date" className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-cyan-300/60" value={projectForm.end_date} onChange={(e) => setProjectForm((p) => ({ ...p, end_date: e.target.value }))} /></div>
                </div>
                <GlowButton type="submit" disabled={busy}>{busy ? "Saving..." : "Create Project"}</GlowButton>
              </fieldset>
            </form>
          </GlassCard>

          {/* Project list */}
          <GlassCard className="p-6">
            <h3 className="mb-4 font-heading text-lg text-textPrimary">All Projects</h3>
            {projects.length === 0 ? (
              <p className="text-sm text-textSecondary">No projects yet.</p>
            ) : (
              <div className="grid gap-3">
                {projects.map((p) => (
                  <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="font-medium text-textPrimary">{p.name}</p>
                    <div className="mt-1 flex gap-3 text-xs text-textSecondary">
                      <span className="capitalize">{p.status}</span>
                      <span>{p.progress_percent}% complete</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Create task */}
          <GlassCard className="p-6">
            <h3 className="mb-4 font-heading text-lg text-textPrimary">Create Task</h3>
            <form onSubmit={handleCreateTask} className="grid gap-3">
              <fieldset disabled={isSuspended} className="grid gap-3 disabled:opacity-70">
                <select className="rounded-xl border border-white/15 bg-bgSecondary px-4 py-2.5 text-sm" value={taskForm.project} onChange={(e) => setTaskForm((p) => ({ ...p, project: e.target.value }))} required>
                  <option value="">Select project</option>
                  {projectOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))} required />
                <textarea className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60" placeholder="Description" rows={2} value={taskForm.description} onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <select className="rounded-xl border border-white/15 bg-bgSecondary px-3 py-2.5 text-sm" value={taskForm.assigned_to} onChange={(e) => setTaskForm((p) => ({ ...p, assigned_to: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {developers.map((d) => <option key={d.id} value={d.id}>{d.username}</option>)}
                  </select>
                  <select className="rounded-xl border border-white/15 bg-bgSecondary px-3 py-2.5 text-sm" value={taskForm.priority} onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value as Task["priority"] }))}>
                    {["low", "medium", "high", "critical"].map((pr) => <option key={pr} value={pr}>{pr}</option>)}
                  </select>
                </div>
                <div className="grid gap-1"><label className="text-xs text-textSecondary">Due date</label><input type="date" className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-cyan-300/60" value={taskForm.due_date} onChange={(e) => setTaskForm((p) => ({ ...p, due_date: e.target.value }))} /></div>
                <GlowButton type="submit" disabled={busy}>{busy ? "Saving..." : "Create Task"}</GlowButton>
              </fieldset>
            </form>
          </GlassCard>

          {/* Task list */}
          <GlassCard className="p-6">
            <h3 className="mb-4 font-heading text-lg text-textPrimary">All Tasks</h3>
            {tasks.length === 0 ? (
              <p className="text-sm text-textSecondary">No tasks yet.</p>
            ) : (
              <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-1">
                {tasks.map((task) => (
                  <div key={task.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="font-medium text-textPrimary">{task.title}</p>
                    <p className="text-xs text-textSecondary">{task.project_name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <select className="rounded-lg border border-white/15 bg-bgSecondary px-2 py-1 text-xs" value={task.status} disabled={isSuspended} onChange={(e) => handleTaskUpdate(task.id, { status: e.target.value as Task["status"] })}>
                        {taskStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select className="rounded-lg border border-white/15 bg-bgSecondary px-2 py-1 text-xs" value={task.assigned_to ?? ""} disabled={isSuspended} onChange={(e) => handleTaskUpdate(task.id, { assigned_to: e.target.value ? Number(e.target.value) : null })}>
                        <option value="">Unassigned</option>
                        {developers.map((d) => <option key={d.id} value={d.id}>{d.username}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </section>
  );
}
