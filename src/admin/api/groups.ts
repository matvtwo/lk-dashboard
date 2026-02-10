const API = import.meta.env.VITE_API_BASE ?? "http://localhost:8081";

async function req(path: string, method: string = "GET", body?: any) {
  const token = localStorage.getItem("token");

  const res = await fetch(API + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    sessionStorage.setItem("afterLogin", window.location.pathname);
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

export const GroupsApi = {
  deleteGroup: (groupId: string) => req(`/api/groups/${groupId}`, "DELETE"),

  deleteStudent: (studentId: string) =>
    req(`/api/admin/students/${studentId}`, "DELETE"),

  setTeacher: (groupId: string, teacherId: string | null) =>
    req("/api/groups/set-teacher", "POST", { groupId, teacherId }),
  listTeachers: () => req("/api/admin/teachers"),
  list: () => req("/api/groups"),
  freeStudents: () => req("/api/groups/free-students"),
  create: (name: string) => req("/api/groups", "POST", { name }),
  add: (groupId: string, userId: string) =>
    req("/api/groups/add", "POST", { groupId, userId }),
  remove: (groupId: string, userId: string) =>
    req("/api/groups/remove", "POST", { groupId, userId }),
  move: (fromGroupId: string, toGroupId: string, userId: string) =>
    req("/api/groups/move", "POST", { fromGroupId, toGroupId, userId }),
};
