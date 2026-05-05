"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { X } from "lucide-react";
import {
  EmployeeUser,
  Task,
  WorkflowProject,
  clearEmployeeSession,
  createTask,
  fetchDeveloperDirectory,
  fetchDeveloperTasks,
  fetchProjects,
  fetchTasks,
  getStoredEmployeeUser,
  updateDeveloperTask,
  updateTask,
} from "@/lib/employee-api";

// ─── constants ────────────────────────────────────────────────────────────────
const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};
const STATUS_COLORS: Record<string, string> = {
  todo: "bg-slate-500/20 text-slate-300 border-slate-400/30",
  in_progress: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  done: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
};
const PRIORITY_COLORS: Record<string, string> = {
  low: "text-sky-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  critical: "text-red-400",
};

const emptyTaskForm = {
  project: "",
  title: "",
  description: "",
  assigned_to: "",
  priority: "medium" as Task["priority"],
  due_date: "",
};

// ─── task card ────────────────────────────────────────────────────────────────
function TaskCard({
  task,
  developers,
  isSuspended,
  isManager,
  onStatusChange,
  onAssigneeChange,
  onTaskClick,
}: {
  task: Task;
  developers: EmployeeUser[];
  isSuspended: boolean;
  isManager: boolean;
  onStatusChange: (id: string, status: Task["status"]) => void;
  onAssigneeChange?: (id: string, assignee: string | null) => void;
  onTaskClick?: (task: Task) => void;
}) {
  return (
    <div 
      className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-3 transition hover:border-cyan-300/30 hover:bg-white/[0.08] cursor-pointer"
      onClick={() => onTaskClick?.(task)}
    >
      {/* Title + status badge */}
      <div className="flex items-start justify-between gap-3">
        <p className="font-heading text-base font-semibold text-textPrimary leading-snug">{task.title}</p>
        <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[task.status]}`}>
          {STATUS_LABELS[task.status]}
        </span>
      </div>

      {/* Meta rows */}
      <div className="flex flex-col gap-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-textSecondary">📁 Project</span>
          <span className="text-right font-medium text-textPrimary">{task.project_name}</span>
        </div>
        {task.due_date && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-textSecondary">📅 Due</span>
            <span className="text-right text-textPrimary">{task.due_date}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <span className="text-textSecondary">⚡ Priority</span>
          <span className={`font-semibold capitalize ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-textSecondary">👤 Assignee</span>
          <span className="text-right font-medium text-textPrimary">
            {task.assigned_to_username || "Unassigned"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
        {/* Status dropdown */}
        <select
          className={`flex-1 rounded-lg border px-2 py-1.5 text-xs outline-none ${STATUS_COLORS[task.status]} bg-transparent cursor-pointer`}
          value={task.status}
          disabled={isSuspended}
          onChange={(e) => onStatusChange(task.id, e.target.value as Task["status"])}
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-bgSecondary text-textPrimary">{STATUS_LABELS[s]}</option>
          ))}
        </select>

        {/* Assignee dropdown (manager only) */}
        {isManager && onAssigneeChange && (
          <select
            className="flex-1 rounded-lg border border-white/15 bg-bgSecondary px-2 py-1.5 text-xs text-textPrimary cursor-pointer"
            value={task.assigned_to ?? ""}
            disabled={isSuspended}
            onChange={(e) => onAssigneeChange(task.id, e.target.value || null)}
          >
            <option value="">Unassigned</option>
            {developers.map((d) => (
              <option key={d.id} value={d.id}>{d.username}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<EmployeeUser | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<WorkflowProject[]>([]);
  const [developers, setDevelopers] = useState<EmployeeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [activeTab, setActiveTab] = useState<"create" | "all">("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const isManager = user?.role === "admin" || user?.role === "project_manager";
  const isDeveloper = user?.role === "developer";
  const isSuspended = user?.is_suspend === true;

  useEffect(() => {
    const u = getStoredEmployeeUser();
    if (!u) { router.replace("/employee/login"); return; }
    if (!["admin", "project_manager", "developer"].includes(u.role)) {
      router.replace("/employee/dashboard"); return;
    }
    setUser(u);

    const isManagerRole = u.role === "admin" || u.role === "project_manager";

    if (isManagerRole) {
      Promise.all([fetchTasks(), fetchProjects(), fetchDeveloperDirectory()])
        .then(([t, p, d]) => { setTasks(t); setProjects(p); setDevelopers(d.results); })
        .catch(() => { clearEmployeeSession(); router.replace("/employee/login"); })
        .finally(() => setLoading(false));
    } else {
      fetchDeveloperTasks()
        .then((d) => setTasks(d.results))
        .catch(() => { clearEmployeeSession(); router.replace("/employee/login"); })
        .finally(() => setLoading(false));
    }
  }, [router]);

  async function handleCreateTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSuspended) { toast.error("Account suspended — read-only access."); return; }
    setBusy(true);
    try {
      await createTask({
        project: taskForm.project,
        title: taskForm.title,
        description: taskForm.description,
        assigned_to: taskForm.assigned_to || null,
        priority: taskForm.priority,
        due_date: taskForm.due_date || undefined,
      });
      setTaskForm(emptyTaskForm);
      setTasks(await fetchTasks());
      toast.success("Task created");
      setActiveTab("all");
    } catch { toast.error("Failed to create task"); }
    finally { setBusy(false); }
  }

  async function handleStatusChange(taskId: string, status: Task["status"]) {
    if (isSuspended) { toast.error("Account suspended — read-only access."); return; }
    try {
      if (isDeveloper) {
        await updateDeveloperTask(taskId, { status });
      } else {
        await updateTask(taskId, { status });
      }
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t));
      toast.success("Status updated");
    } catch { toast.error("Failed to update status"); }
  }

  async function handleAssigneeChange(taskId: string, assignedTo: string | null) {
    if (isSuspended) { toast.error("Account suspended — read-only access."); return; }
    try {
      await updateTask(taskId, { assigned_to: assignedTo } as Partial<Task>);
      const dev = developers.find((d) => d.id === assignedTo);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, assigned_to: assignedTo, assigned_to_username: dev?.username ?? "" }
            : t
        )
      );
      toast.success("Assignee updated");
    } catch { toast.error("Failed to update assignee"); }
  }

  const projectOptions = useMemo(() => projects.map((p) => ({ id: p.id, name: p.name })), [projects]);

  const inputCls = "rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-cyan-300/60 placeholder:text-textSecondary/60";
  const selectCls = "rounded-xl border border-white/15 bg-bgSecondary px-4 py-2.5 text-sm text-textPrimary";

  if (loading || !user) {
    return (
      <section className="section-shell pt-36">
        <GlassCard className="mx-auto max-w-md p-8 text-center text-textSecondary">Loading tasks...</GlassCard>
      </section>
    );
  }

  // ── Developer view ─────────────────────────────────────────────────────────
  if (isDeveloper) {
    return (
      <section className="section-shell pt-36 pb-20">
        <SectionTitle title="My Tasks" subtitle="View and update the status of your assigned tasks" />

        {isSuspended && (
          <GlassCard className="mb-6 border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-200">
            Your account is suspended. Read-only access.
          </GlassCard>
        )}

        {tasks.length === 0 ? (
          <GlassCard className="p-6 text-center text-textSecondary">No tasks assigned to you yet.</GlassCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                developers={[]}
                isSuspended={isSuspended}
                isManager={false}
                onStatusChange={handleStatusChange}
                onTaskClick={setSelectedTask}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  // ── Manager view ───────────────────────────────────────────────────────────
  return (
    <section className="section-shell pt-36 pb-20">
      <SectionTitle title="Tasks" subtitle="Create and manage project tasks" />

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
            {tab === "create" ? "Create Task" : `All Tasks (${tasks.length})`}
          </button>
        ))}
      </div>

      {/* ── Create Task tab ───────────────────────────────────────────────── */}
      {activeTab === "create" && (
        <GlassCard className="mx-auto max-w-lg p-6">
          <h3 className="mb-4 font-heading text-lg font-semibold text-textPrimary">New Task</h3>
          <form onSubmit={handleCreateTask} className="grid gap-3">
            <fieldset disabled={isSuspended} className="grid gap-3 disabled:opacity-70">
              <select id="task-project-select" className={selectCls} value={taskForm.project} onChange={(e) => setTaskForm((p) => ({ ...p, project: e.target.value }))} required>
                <option value="">Select project *</option>
                {projectOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input id="task-title-input" className={inputCls} placeholder="Task title *" value={taskForm.title} onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))} required />
              <textarea id="task-desc-input" className={inputCls} placeholder="Description" rows={2} value={taskForm.description} onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <select id="task-assignee-select" className={selectCls} value={taskForm.assigned_to} onChange={(e) => setTaskForm((p) => ({ ...p, assigned_to: e.target.value }))}>
                  <option value="">Unassigned</option>
                  {developers.map((d) => <option key={d.id} value={d.id}>{d.username}</option>)}
                </select>
                <select id="task-priority-select" className={selectCls} value={taskForm.priority} onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value as Task["priority"] }))}>
                  {["low", "medium", "high", "critical"].map((pr) => <option key={pr} value={pr} className="capitalize">{pr}</option>)}
                </select>
              </div>
              <div className="grid gap-1">
                <label className="text-xs text-textSecondary">Due date</label>
                <input type="date" id="task-due-date" className={inputCls} value={taskForm.due_date} onChange={(e) => setTaskForm((p) => ({ ...p, due_date: e.target.value }))} />
              </div>
              <GlowButton type="submit" disabled={busy} id="create-task-btn">{busy ? "Saving..." : "Create Task"}</GlowButton>
            </fieldset>
          </form>
        </GlassCard>
      )}

      {/* ── All Tasks tab ─────────────────────────────────────────────────── */}
      {activeTab === "all" && (
        <>
          {tasks.length === 0 ? (
            <GlassCard className="p-8 text-center text-sm text-textSecondary">No tasks yet.</GlassCard>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  developers={developers}
                  isSuspended={isSuspended}
                  isManager={isManager}
                  onStatusChange={handleStatusChange}
                  onAssigneeChange={handleAssigneeChange}
                  onTaskClick={setSelectedTask}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Task Modal */}
      {selectedTask && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" 
          onClick={() => setSelectedTask(null)}
        >
          <div 
            className="bg-bgSecondary border border-white/10 rounded-2xl w-full max-w-lg p-6 relative overflow-hidden shadow-2xl animate-fade-in" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-textSecondary hover:text-white transition" 
              onClick={() => setSelectedTask(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <p className="text-sm font-medium text-cyan-300 mb-1">{selectedTask.project_name}</p>
            <h2 className="text-xl font-semibold text-textPrimary pr-8 mb-4 leading-snug">{selectedTask.title}</h2>
            
            <div className="space-y-4 text-sm text-textPrimary">
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl">
                <div>
                  <span className="text-textSecondary block text-xs mb-0.5">Assignee</span>
                  <p>{selectedTask.assigned_to_username || "Unassigned"}</p>
                </div>
                <div>
                  <span className="text-textSecondary block text-xs mb-0.5">Priority</span>
                  <p className="capitalize">{selectedTask.priority}</p>
                </div>
                {selectedTask.due_date && (
                  <div className="col-span-2">
                    <span className="text-textSecondary block text-xs mb-0.5">Due Date</span>
                    <p>{selectedTask.due_date}</p>
                  </div>
                )}
              </div>
              
              {selectedTask.description && (
                <div>
                  <span className="text-textSecondary block text-xs mb-1.5">Description</span>
                  <p className="bg-white/5 p-4 rounded-xl whitespace-pre-wrap leading-relaxed text-xs">
                    {selectedTask.description}
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
