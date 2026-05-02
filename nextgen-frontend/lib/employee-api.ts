import axios from "axios";

const baseApi = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export type EmployeeRole = "admin" | "hr" | "sales" | "project_manager" | "developer";
export type EmployeeAccountStatus = "active" | "suspend" | "block";

export type EmployeeUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: EmployeeRole;
  account_status: EmployeeAccountStatus;
};

export type LeadStatus = "new" | "qualified" | "negotiation" | "won" | "lost";
export type TaskStatus = "todo" | "in_progress" | "done";

export type Lead = {
  id: number;
  title: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  requirements: string;
  estimated_value: string | null;
  status: LeadStatus;
  owner: number;
  owner_username: string;
  created_at: string;
  updated_at: string;
};

export type WorkflowProject = {
  id: number;
  name: string;
  description: string;
  source_lead: number | null;
  sales_owner: number | null;
  sales_owner_username: string;
  project_manager: number | null;
  project_manager_username: string;
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  progress_percent: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: number;
  project: number;
  project_name: string;
  milestone: number | null;
  title: string;
  description: string;
  assigned_to: number | null;
  assigned_to_username: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high" | "critical";
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  estimated_hours: string | null;
  actual_hours: string | null;
  created_at: string;
  updated_at: string;
};

export type DashboardPayload = {
  success: boolean;
  role: EmployeeRole;
  metrics: Record<string, number>;
};

const employeeApi = axios.create({
  baseURL: `${baseApi}/workflow`,
  withCredentials: true,
});

employeeApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("employee_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let refreshingTokenPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (!refreshingTokenPromise) {
    const refresh = localStorage.getItem("employee_refresh_token");
    if (!refresh) return null;

    refreshingTokenPromise = employeeApi
      .post("/auth/token/refresh/", { refresh })
      .then((response) => {
        const access = response.data?.access as string | undefined;
        const nextRefresh = response.data?.refresh as string | undefined;
        if (access) {
          localStorage.setItem("employee_access_token", access);
          if (nextRefresh) {
            localStorage.setItem("employee_refresh_token", nextRefresh);
          }
          return access;
        }
        return null;
      })
      .catch(() => {
        clearEmployeeSession();
        return null;
      })
      .finally(() => {
        refreshingTokenPromise = null;
      });
  }

  return refreshingTokenPromise;
}

employeeApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const requestUrl = String(request?.url ?? "");
    const isRefreshCall = requestUrl.includes("/auth/token/refresh/");

    if (isRefreshCall && error.response?.status === 401) {
      clearEmployeeSession();
      if (typeof window !== "undefined") {
        window.location.replace("/employee/login");
      }
      return Promise.reject(error);
    }

    if (!request || request._retry || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    request._retry = true;
    const token = await refreshAccessToken();
    if (!token) return Promise.reject(error);

    request.headers.Authorization = `Bearer ${token}`;
    return employeeApi(request);
  }
);

export function persistEmployeeSession(access: string, refresh: string, user: EmployeeUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem("employee_access_token", access);
  localStorage.setItem("employee_refresh_token", refresh);
  localStorage.setItem("employee_user", JSON.stringify(user));
}

export function clearEmployeeSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("employee_access_token");
  localStorage.removeItem("employee_refresh_token");
  localStorage.removeItem("employee_user");
}

export function getStoredEmployeeUser(): EmployeeUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("employee_user");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as EmployeeUser;
  } catch {
    return null;
  }
}

export async function employeeLogin(payload: {
  username: string;
  password: string;
  role: EmployeeRole;
}) {
  // The backend field is now called `identifier` (accepts username or email)
  const body = { identifier: payload.username, password: payload.password, role: payload.role };
  const { data } = await employeeApi.post("/auth/login/", body);
  return data as {
    success: boolean;
    access: string;
    refresh: string;
    user: EmployeeUser;
  };
}

export async function employeeLogout() {
  const refresh = typeof window !== "undefined" ? localStorage.getItem("employee_refresh_token") : null;
  await employeeApi.post("/auth/logout/", { refresh });
}

export async function employeeMe() {
  const { data } = await employeeApi.get("/auth/me/");
  return data as { success: boolean; user: EmployeeUser };
}

export async function updateMyProfile(payload: {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  old_password?: string;
  new_password?: string;
  confirm_password?: string;
}) {
  const { data } = await employeeApi.patch("/auth/profile/", payload);
  return data as { success: boolean; user: EmployeeUser };
}

export async function fetchEmployees() {
  const { data } = await employeeApi.get("/auth/employees/");
  return data as EmployeeUser[];
}

export async function createEmployee(payload: {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  password: string;
  role: EmployeeRole;
  account_status?: EmployeeAccountStatus;
}) {
  const { data } = await employeeApi.post("/auth/employees/", payload);
  return data as EmployeeUser;
}

export async function updateEmployee(employeeId: number, payload: Partial<Pick<EmployeeUser, "first_name" | "last_name" | "email" | "role" | "account_status">>) {
  const { data } = await employeeApi.patch(`/auth/employees/${employeeId}/`, payload);
  return data as EmployeeUser;
}

export async function fetchDashboard() {
  const { data } = await employeeApi.get("/dashboard/");
  return data as DashboardPayload;
}

export async function fetchLeads() {
  const { data } = await employeeApi.get("/leads/");
  return data as { count: number; next: string | null; previous: string | null; results?: Lead[] } | Lead[];
}

export async function createLead(payload: Partial<Lead>) {
  const { data } = await employeeApi.post("/leads/", payload);
  return data as Lead;
}

export async function updateLead(leadId: number, payload: Partial<Lead>) {
  const { data } = await employeeApi.patch(`/leads/${leadId}/`, payload);
  return data as Lead;
}

export async function fetchProjects() {
  const { data } = await employeeApi.get("/projects/");
  return data as WorkflowProject[];
}

export async function createProject(payload: Partial<WorkflowProject>) {
  const { data } = await employeeApi.post("/projects/", payload);
  return data as WorkflowProject;
}

export async function updateProject(projectId: number, payload: Partial<WorkflowProject>) {
  const { data } = await employeeApi.patch(`/projects/${projectId}/`, payload);
  return data as WorkflowProject;
}

export async function fetchTasks() {
  const { data } = await employeeApi.get("/tasks/");
  return data as Task[];
}

export async function createTask(payload: Partial<Task>) {
  const { data } = await employeeApi.post("/tasks/", payload);
  return data as Task;
}

export async function updateTask(taskId: number, payload: Partial<Task>) {
  const { data } = await employeeApi.patch(`/tasks/${taskId}/`, payload);
  return data as Task;
}

export async function fetchDeveloperTasks() {
  const { data } = await employeeApi.get("/developer/tasks/");
  return data as { success: boolean; results: Task[] };
}

export async function updateDeveloperTask(taskId: number, payload: Partial<Task>) {
  const { data } = await employeeApi.patch(`/developer/tasks/${taskId}/`, payload);
  return data as { success: boolean; task: Task };
}

export async function fetchDeveloperDirectory() {
  const { data } = await employeeApi.get("/auth/employees/directory/");
  return data as { success: boolean; results: EmployeeUser[] };
}

export default employeeApi;
