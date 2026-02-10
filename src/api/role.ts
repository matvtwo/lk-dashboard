const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';

export async function getRole(): Promise<string> {
  const token = localStorage.getItem('token');
  const r = await fetch(`${API_BASE}/api/role`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!r.ok) throw new Error('Failed to load role');
  const data = await r.json();
  return data.role;
}
