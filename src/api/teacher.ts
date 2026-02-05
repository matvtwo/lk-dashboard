const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:8081';

async function req(path: string, body?: any) {
  const token = localStorage.getItem('token');

  const res = await fetch(API + path, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export const TeacherApi = {
  groups: () => req('/api/teacher/groups'),
  group: (id: string) => req(`/api/teacher/groups/${id}`),
  changePoints: (userId: string, delta: number) =>
    req('/api/teacher/points', { userId, delta }),
};
