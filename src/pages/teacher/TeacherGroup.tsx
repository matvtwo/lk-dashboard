import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TeacherApi } from '../../api/teacher';

export default function TeacherGroup() {
  const { id } = useParams();
  const [group, setGroup] = useState<any | null>(null);

  async function load() {
    const data = await TeacherApi.group(id!);
    setGroup(data);
  }

  useEffect(() => {
    load();
  }, [id]);

  if (!group) {
    return <div className="student-root">Загрузка…</div>;
  }

  return (
    <div className="student-root">
      <h1 className="student-title">{group.name}</h1>

      <div className="student-grid">
        {group.members.map((m: any) => (
          <div key={m.user.id} className="student-card student-card--green">
            <div className="student-card-title">{m.user.email}</div>
            <div>Баланс: {m.user.balance}</div>

            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button
                onClick={async () => {
                  await TeacherApi.changePoints(m.user.id, 10);
                  load();
                }}
              >
                +10
              </button>

              <button
                onClick={async () => {
                  await TeacherApi.changePoints(m.user.id, -10);
                  load();
                }}
              >
                −10
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
