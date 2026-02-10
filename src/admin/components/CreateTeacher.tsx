import { AdminApi } from '../api/admin';

export default function CreateTeacher({ onCreated }: { onCreated: () => void }) {
  async function create() {
    const email = prompt('Email преподавателя');
    if (!email) return;

    const password = prompt('Пароль преподавателя (временный)');
    if (!password) return;

    try {
      const res = await AdminApi.createTeacher(email, password);
      alert(`Преподаватель создан:\n${res.email}\nРоль: ${res.role}`);
      onCreated();
    } catch (err: any) {
      alert(err?.message ?? 'Ошибка создания преподавателя');
    }
  }

  return (
    <button
      onClick={create}
      style={{
        padding: '10px 14px',
        borderRadius: 10,
        border: '1px solid #111',
        background: '#fff',
        cursor: 'pointer',
      }}
    >
      + Добавить преподавателя
    </button>
  );
}
