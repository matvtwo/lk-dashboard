import { useEffect, useState } from 'react';
import { AuditApi } from '../api/audit';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    AuditApi.list().then(setLogs);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Журнал действий</h1>

      {logs.map(l => (
        <div key={l.id} style={{ marginBottom: 12 }}>
          <div>{l.message}</div>
          <small style={{ color: '#666' }}>
            {new Date(l.createdAt).toLocaleString('ru-RU')} — {l.actor?.email}
          </small>
        </div>
      ))}
    </div>
  );
}
