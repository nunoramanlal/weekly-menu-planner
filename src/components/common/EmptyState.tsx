interface Props {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  action,
}: Props) {
  return (
    <div className="state-card">
      <div className="empty-icon">+</div>

      <h3>{title}</h3>

      <p>{description}</p>

      {action && (
        <div className="empty-action">
          {action}
        </div>
      )}
    </div>
  );
}