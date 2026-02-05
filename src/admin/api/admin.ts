const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:8081';

async function req(path: string, body?: any) {
  const token = localStorage.getItem('token');

  const res = await fetch(API + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // ⛔ если токен протух / нет прав — выкидываем на логин
  if (res.status === 401) {
    localStorage.removeItem('token');
    sessionStorage.setItem('afterLogin', window.location.pathname);
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }

  return res.json();
}

export const AdminApi = {
  createStudent: (email: string) =>
    req('/api/admin/students', { email }),

  resetStudentPassword: (id: string) =>
    req(`/api/admin/students/${id}/reset-password`),

  changeStudentEmail: (id: string, email: string) =>
    req(`/api/admin/students/${id}/change-email`, { email }),
};
