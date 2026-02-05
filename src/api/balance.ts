const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';

export async function getBalance(): Promise<number> {
  const r = await fetch(`${API_BASE}/api/balance`);
  if (!r.ok) throw new Error('Failed to load balance');
  const data = await r.json();
  return data.balance;
}

export async function addBalance(amount: number): Promise<number> {
  const r = await fetch(`${API_BASE}/api/balance/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  if (!r.ok) throw new Error('Failed to add balance');
  const data = await r.json();
  return data.balance;
}
