import { useEffect, useState } from 'react';
import { getBalance, addBalance } from '../api/balance';

export default function BalanceCard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBalance()
      .then(setBalance)
      .catch(() => setBalance(null));
  }, []);

  async function onAdd() {
    try {
      setLoading(true);
      const next = await addBalance(10);
      setBalance(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={card}>
      <h2>Баланс робочеков</h2>
      <p style={balanceStyle}>
        {balance === null ? '—' : balance}
      </p>
      <button style={button} onClick={onAdd} disabled={loading}>
        {loading ? 'Начисляем…' : 'Начислить за занятие'}
      </button>
    </div>
  );
}

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 24,
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
} as const;

const balanceStyle = {
  fontSize: 36,
  fontWeight: 600,
} as const;

const button = {
  marginTop: 16,
  padding: '10px 16px',
  borderRadius: 8,
  border: 'none',
  background: '#3b5bfd',
  color: '#fff',
  cursor: 'pointer',
} as const;
