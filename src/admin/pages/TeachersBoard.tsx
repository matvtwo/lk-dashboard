import React, { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import AdminLayout from "../components/AdminLayout";
import CreateTeacher from "../components/CreateTeacher";
import { GroupsApi } from "../api/groups";
import { AdminApi } from "../api/admin";

// --- Main Page Component ---
export const TeachersBoard = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const deleteGroup = async (groupId: string) => {
    if (!confirm("Delete this group? This action cannot be undone.")) return;

    try {
      await GroupsApi.deleteGroup(groupId);

      // Optimistic UI update
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete group");
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const loadData = async () => {
    try {
      setError(null);
      const [gData, tData] = await Promise.all([
        GroupsApi.list(),
        AdminApi.listTeachers(),
      ]);
      setGroups(gData);
      setTeachers(tData);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const groupId = String(active.id);
    const newTeacherId = over.id === "unassigned" ? null : String(over.id);

    // Optimistic UI Update
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, teacherId: newTeacherId } : g,
      ),
    );

    try {
      await GroupsApi.setTeacher(groupId, newTeacherId);
      // Optional: reload to sync with server state
      // await loadData();
    } catch (err: any) {
      setError(err?.message ?? "Failed to save assignment");
      loadData(); // Revert on failure
    }
  };

  return (
    <AdminLayout
      title="Админ-панель:учителя"
      actions={<CreateTeacher onCreated={loadData} />}
    >
      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 12,
            background: "#ffecec",
            border: "1px solid #ffb7b7",
            color: "#7a0000",
          }}
        >
          {error}
        </div>
      )}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            overflowX: "auto",
            pb: 20,
          }}
        >
          {/* Column for Unassigned Groups */}
          <Column id="unassigned" title="Без учителя">
            {groups.filter((g) => !g.teacherId).length === 0 && (
              <Empty text="Все группы распределены" />
            )}
            {groups
              .filter((g) => !g.teacherId)
              .map((group) => (
                <Card
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  onDelete={() => deleteGroup(group.id)}
                />
              ))}
          </Column>

          {/* Columns for each Teacher */}
          {teachers.map((teacher) => (
            <Column
              key={teacher.id}
              id={teacher.id}
              title={teacher.displayName || teacher.name || teacher.email}
            >
              {groups.filter((g) => g.teacherId === teacher.id).length ===
                0 && <Empty text="Нет групп" />}
              {groups
                .filter((g) => g.teacherId === teacher.id)
                .map((group) => (
                  <Card
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    onDelete={() => deleteGroup(group.id)}
                  />
                ))}
            </Column>
          ))}
        </div>
      </DndContext>
    </AdminLayout>
  );
};

// --- Sub-Components ---

function Column({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`card column ${isOver ? "column--over" : ""}`}
      style={{ width: 300, minHeight: 400 }}
    >
      <h3 className="column__title">{title}</h3>
      <div className="column__content">{children}</div>
    </div>
  );
}

function Card({
  id,
  name,
  onDelete,
}: {
  id: string;
  name: string;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`card card--item card--group ${
        isDragging ? "card--dragging" : ""
      }`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center", // ✅ FIXED
        gap: 8,
      }}
      {...listeners}
      {...attributes}
    >
      <div style={{ fontWeight: 500 }}>{name}</div>

      <button
        className="group-delete-btn"
        onClick={(e) => {
          e.stopPropagation(); // 🚨 REQUIRED for dnd-kit
          e.preventDefault();
          onDelete();
        }}
        title="Delete group"
      >
        ✕
      </button>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="empty">{text}</div>;
}
