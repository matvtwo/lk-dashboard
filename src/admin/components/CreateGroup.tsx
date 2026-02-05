import { useState } from 'react';
import { GroupsApi } from '../api/groups';

export default function CreateGroup({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      await GroupsApi.create(name.trim());
      setName('');
      onCreated();
    } catch (err: any) {
      alert(err?.message ?? 'Ошибка создания группы');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        placeholder="Название группы"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          border: '1px solid #d7dbe3',
          minWidth: 220,
        }}
      />
      <button
        disabled={loading}
        style={{
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid #111',
          background: '#111',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Создаём…' : 'Создать группу'}
      </button>
    </form>
  );
}
