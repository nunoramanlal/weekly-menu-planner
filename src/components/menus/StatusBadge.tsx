import type { MenuStatus } from '../../types/menu';

interface Props {
  status: MenuStatus;
}

const labels: Record<MenuStatus, string> = {
  current: 'Current',
  previous: 'Previous',
  backlog: 'Backlog',
};

export default function StatusBadge({
  status,
}: Props) {
  return (
    <span
      className={`status-badge status-${status}`}
    >
      {labels[status]}
    </span>
  );
}