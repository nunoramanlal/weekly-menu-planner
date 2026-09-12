import type { Menu, MenuStatus } from '../../types/menu';

import {
  formatDate,
  getWeekLabel,
} from '../../utils/date';

interface Props {
  menu: Menu;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onStatusChange: (status: MenuStatus) => void;
  children?: React.ReactNode;
}

export default function MenuCard({
  menu,
  expanded,
  onToggle,
  onDelete,
  onStatusChange,
  children,
}: Props) {
  return (
    <article className="menu-card">
      <div className="menu-card-header">
        <button
          className="menu-card-main"
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <div className="eyebrow">
            {getWeekLabel(menu.week_start)}
          </div>

          <h3>
            Week starting{' '}
            {formatDate(menu.week_start)}
          </h3>
        </button>

        <button
          className="icon-button danger-icon"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete menu for ${formatDate(
            menu.week_start
          )}`}
          title="Delete menu"
        >
          ×
        </button>
      </div>

      <div className="menu-card-meta">
        <select
          className={`status-select status-${menu.status}`}
          value={menu.status}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            event.stopPropagation();
            onStatusChange(event.target.value as MenuStatus);
          }}
          aria-label={`Change status for menu starting ${formatDate(
            menu.week_start
          )}`}
        >
          <option value="current">Current</option>
          <option value="previous">Previous</option>
          <option value="backlog">Backlog</option>
        </select>
      </div>

      {menu.notes && (
        <p className="menu-card-notes">
          {menu.notes}
        </p>
      )}

      <div className="menu-card-footer">
        <button
          className="button secondary small"
          type="button"
          onClick={onToggle}
        >
          {expanded ? 'Hide menu' : 'View menu'}
        </button>
      </div>

      {expanded && (
        <div className="menu-card-expanded">
          {children}
        </div>
      )}
    </article>
  );
}