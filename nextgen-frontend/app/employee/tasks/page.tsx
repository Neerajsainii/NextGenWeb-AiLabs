"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  EmployeeUser,
  Task,
  clearEmployeeSession,
  fetchDeveloperTasks,
  getStoredEmployeeUser,
  updateDeveloperTask,
} from "@/lib/employee-api";

const taskStatuses = ["todo", "in_progress", "done"] as const;

export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<EmployeeUser | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuspended = user?.is_suspend === true;

  useEffect(() => {
    const u = getStoredEmployeeUser();
    if (!u) { router.replace("/employee/login"); return; }
    if (!["admin", "developer"].includes(u.role)) { router.replace("/employee/dashboard"); return; }
    setUser(u);
    fetchDeveloperTasks()
      .then((d) => setTasks(d.results))
      .catch(() => { clearEmployeeSession(); router.replace("/employee/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleStatusUpdate(taskId: number, status: Task["status"]) {
    if (isSuspended) { toast.error("Account suspended — read-only access."); return; }
    try {
      await updateDeveloperTask(taskId, { status });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
      toast.success("Task updated");
    } catch {
      toast.error("Failed to update task");
    }
  }

  if (loading || !user) {
    return (
      <section className="section-shell pt-36">
        <GlassCard className="mx-auto max-w-md p-8 text-center text-textSecondary">Loading tasks...</GlassCard>
      </section>
    );
  }

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
            <GlassCard key={task.id} className="p-5">
              <p className="font-medium text-textPrimary">{task.title}</p>
              <p className="mt-1 text-xs text-textSecondary">Project: {task.project_name}</p>
              {task.due_date && (
                <p className="mt-0.5 text-xs text-textSecondary/60">Due: {task.due_date}</p>
              )}
              <div className="mt-1 flex items-center gap-2">
                <span className={`text-xs font-medium capitalize ${task.priority === "critical" ? "text-red-400" : task.priority === "high" ? "text-orange-400" : "text-textSecondary"}`}>
                  {task.priority}
                </span>
              </div>
              <select
                className="mt-3 w-full rounded-lg border border-white/15 bg-bgSecondary px-3 py-1.5 text-xs"
                value={task.status}
                disabled={isSuspended}
                onChange={(e) => handleStatusUpdate(task.id, e.target.value as Task["status"])}
              >
                {taskStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </GlassCard>
          ))}
        </div>
      )}
    </section>
  );
}
