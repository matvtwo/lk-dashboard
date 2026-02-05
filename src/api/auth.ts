const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:8081';

export async function login(email: string, password: string) {
  const res = await fetch(API + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? 'Login failed');
  }

  return res.json() as Promise<{ accessToken: string }>;
}
