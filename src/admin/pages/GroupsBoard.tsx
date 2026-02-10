import { useEffect, useMemo, useState } from "react";
import CreateTeacher from "../components/CreateTeacher";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  DragOverlay,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import AdminLayout from "../components/AdminLayout";
import { GroupsApi } from "../api/groups";
import CreateGroup from "../components/CreateGroup";
import CreateStudent from "../components/CreateStudent";
import StudentModal from "../components/StudentModal";

type Student = { id: string; email: string };
type Group = { id: string; name: string; members: { user: Student }[] };

const FREE_ID = "free";

export default function GroupsBoard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [free, setFree] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);

  /* ================== MOBILE-FRIENDLY SENSORS ================== */
  const sensors = useSensors(
    // Desktop / mouse
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),

    // Mobile / touch
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180, // long-press
        tolerance: 8, // finger jitter
      },
    }),
  );
  const activeStudent =
    free.find((s) => s.id === activeId) ??
    groups
      .flatMap((g) => g.members.map((m) => m.user))
      .find((u) => u.id === activeId);
  async function load() {
    try {
      setError(null);
      const [g, f] = await Promise.all([
        GroupsApi.list(),
        GroupsApi.freeStudents(),
      ]);
      setGroups(g);
      setFree(f);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  const groupIds = useMemo(() => groups.map((g) => g.id), [groups]);

  async function onDragEnd(e: DragEndEvent) {
    setActiveId(null);

    const userId = String(e.active.id);
    const to = e.over?.id ? String(e.over.id) : null;
    if (!to) return;

    const fromGroup = groups.find((g) =>
      g.members.some((m) => m.user.id === userId),
    );
    const toGroup = groups.find((g) => g.id === to);

    try {
      setError(null);

      if (to === FREE_ID) {
        if (fromGroup) {
          await GroupsApi.remove(fromGroup.id, userId);
        }
        await load();
        return;
      }

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
          <CreateTeacher onCreated={load} />
          <CreateGroup onCreated={load} />
        </>
      }
    >
      {error && <div className="alert alert--danger">{error}</div>}

      <DndContext
        sensors={sensors}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <Column id={FREE_ID} title="Без группы">
            {free.length === 0 && <Empty text="Нет учеников" />}
            {free.map((s) => (
              <Card
                key={s.id}
                id={s.id}
                onOptions={() => setSelectedStudent(s)}
              >
                {s.email}
              </Card>
            ))}
          </Column>

          {groups.map((g) => (
            <Column key={g.id} id={g.id} title={g.name}>
              {g.members.length === 0 && <Empty text="Пусто" />}
              {g.members.map((m) => (
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

        {/* ===== MOBILE DRAG OVERLAY ===== */}
        <DragOverlay>
          {activeStudent ? (
            <div
              className="card card--item card--drag-overlay"
              style={{ transform: "scale(1.05)" }}
            >
              <div className="card__content">
                <div className="card__text">{activeStudent.email}</div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div style={{ display: "none" }}>{groupIds.join(",")}</div>

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
      className={`card column ${isOver ? "column--over" : ""}`}
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useDraggable({ id });

  // 🔒 HARD RULE: never allow scaleY from dnd-kit
  const safeTransform = transform
    ? {
        x: transform.x,
        y: transform.y,
        scaleX: 1.05, // subtle, controlled
        scaleY: 1, // 🚫 NO vertical stretch
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      className={`card card--item ${isDragging ? "card--dragging" : ""}`}
      style={{
        transform: safeTransform
          ? CSS.Transform.toString(safeTransform)
          : undefined,
        transition,
        touchAction: "manipulation",
      }}
      {...listeners}
      {...attributes}
    >
      <div className="card__content">
        <div className="card__text">{children}</div>

        {onOptions && (
          <button
            className="card__options"
            onClick={(e) => {
              e.stopPropagation();
              onOptions();
            }}
          >
            ⚙
          </button>
        )}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="empty">{text}</div>;
}
