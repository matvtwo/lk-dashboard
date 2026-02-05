const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:8081';

async function req(path: string, body?: any) {
  const token = localStorage.getItem('token');

  console.log('[API] request', path, body);

  const res = await fetch(API + path, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  console.log('[API] response', res.status, text);

  if (!res.ok) {
    throw new Error(text);
  }

  return text ? JSON.parse(text) : null;
}

export const StudentApi = {
  me: () => req('/api/student/me'),
  changePassword: (password: string) =>
    req('/api/student/change-password', { password }),
};
