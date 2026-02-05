const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:8081';

async function req(path: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(API + path, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
if (res.status === 401) {
  localStorage.removeItem('token');
  sessionStorage.setItem('afterLogin', window.location.pathname);
  window.location.href = '/login';
  throw new Error('Unauthorized');
}

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const AuditApi = {
  list: () => req('/api/audit'),
};
