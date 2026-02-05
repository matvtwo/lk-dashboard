export default function AdminLayout({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="admin">
      <header className="admin__header">
        <h1 className="admin__title">{title}</h1>
        {actions && <div className="admin__actions">{actions}</div>}
      </header>

      <section className="admin__content">
        {children}
      </section>
    </div>
  );
}
