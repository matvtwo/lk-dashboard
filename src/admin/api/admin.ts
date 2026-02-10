const API = import.meta.env.VITE_API_BASE ?? "http://localhost:8081";

async function req(
  path: string,
  method: "POST" | "DELETE" | "GET" = "POST",
  body?: any,
) {
  const token = localStorage.getItem("token");

  const res = await fetch(API + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // ⛔ token expired / no rights → redirect to login
  if (res.status === 401) {
    localStorage.removeItem("token");
    sessionStorage.setItem("afterLogin", window.location.pathname);
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  // DELETE may return empty body
  if (res.status === 204) return null;

  return res.json();
}

export const AdminApi = {
  createStudent: (email: string) =>
    req("/api/admin/students", "POST", { email }),

  createTeacher: (data: { email: string; password?: string; name?: string }) =>
    req("/api/admin/teachers", "POST", data),

  resetStudentPassword: (id: string) =>
    req(`/api/admin/students/${id}/reset-password`, "POST"),

  changeStudentEmail: (id: string, email: string) =>
    req(`/api/admin/students/${id}/change-email`, "POST", { email }),

  deleteStudent: (id: string) => req(`/api/admin/students/${id}`, "DELETE"),

  listTeachers: () => req("/api/admin/teachers/list", "POST"),
};
