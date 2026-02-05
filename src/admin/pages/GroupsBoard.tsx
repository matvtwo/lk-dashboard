import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import AdminLayout from '../components/AdminLayout';
import { GroupsApi } from '../api/groups';
import CreateGroup from '../components/CreateGroup';
import CreateStudent from '../components/CreateStudent';
import StudentModal from '../components/StudentModal';

type Student = { id: string; email: string };
type Group = { id: string; name: string; members: { user: Student }[] };

const FREE_ID = 'free';

export default function GroupsBoard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [free, setFree] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
const [selectedStudent, setSelectedStudent] =
  useState<Student | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function load() {
    try {
      setError(null);
      const [g, f] = await Promise.all([GroupsApi.list(), GroupsApi.freeStudents()]);
      setGroups(g);
      setFree(f);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  const groupIds = useMemo(() => groups.map(g => g.id), [groups]);

  async function onDragEnd(e: DragEndEvent) {
    const userId = String(e.active.id);
    const to = e.over?.id ? String(e.over.id) : null;
    if (!to) return;

    const fromGroup = groups.find(g => g.members.some(m => m.user.id === userId));
    const toGroup = groups.find(g => g.id === to);

    try {
      setError(null);

      // В "Без группы"
      if (to === FREE_ID) {
        if (fromGroup) {
          await GroupsApi.remove(fromGroup.id, userId);
        }
        await load();
        return;
      }

      // В конкретную группу
      if (!toGroup) return;

      if (!fromGroup) {
        await GroupsApi.add(toGroup.id, userId);
      } else if (fromGroup.id !== toGroup.id) {
        await GroupsApi.move(fromGroup.id, toGroup.id, userId);
      }

      await load();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    }
  }

  return (
    <AdminLayout
      title="Админ-панель"
      actions={
        <>
          <CreateStudent onCreated={load} />
          <CreateGroup onCreated={load} />
        </>
      }
    >
      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 12,
            background: '#ffecec',
            border: '1px solid #ffb7b7',
            color: '#7a0000',
          }}
        >
          {error}
        </div>
      )}

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Column id={FREE_ID} title="Без группы">
            {free.length === 0 && <Empty text="Нет учеников" />}
{free.map(s => (
  <Card
    key={s.id}
    id={s.id}
    onOptions={() => setSelectedStudent(s)}
  >
    {s.email}
  </Card>
))}


          </Column>

          {groups.map(g => (
            <Column key={g.id} id={g.id} title={g.name}>
              {g.members.length === 0 && <Empty text="Пусто" />}
{g.members.map(m => (
  <Card
    key={m.user.id}
    id={m.user.id}
    onOptions={() => setSelectedStudent(m.user)}
  >
    {m.user.email}
  </Card>
))}

            </Column>
          ))}
        </div>
      </DndContext>

      {/* скрытая проверка, что колонки реально существуют */}
      <div style={{ display: 'none' }}>{groupIds.join(',')}</div>
{selectedStudent && (
  <StudentModal
    student={selectedStudent}
    onClose={() => setSelectedStudent(null)}
    onUpdated={load}
  />
)}


    </AdminLayout>
  );
}

function Column({ id, title, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`card column ${isOver ? 'column--over' : ''}`}
      style={{ width: 300 }}
    >
      <h3 className="column__title">{title}</h3>
      <div className="column__content">{children}</div>
    </div>
  );
}

function Card({
  id,
  children,
  onOptions,
}: {
  id: string;
  children: React.ReactNode;
  onOptions?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`card card--item ${isDragging ? 'card--dragging' : ''}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}
      {...listeners}
      {...attributes}
    >
      {/* Имя ученика */}
      <div
        style={{
          flex: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {children}
      </div>

      {/* Кнопка опций */}
      {onOptions && (
        <button
          onClick={e => {
            e.stopPropagation(); // ❗ не даём DnD перехватить клик
            onOptions();
          }}
          title="Опции ученика"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            lineHeight: 1,
            opacity: 0.7,
          }}
        >
          ⚙
        </button>
      )}
    </div>
  );
}



function Empty({ text }: { text: string }) {
  return <div className="empty">{text}</div>;
}