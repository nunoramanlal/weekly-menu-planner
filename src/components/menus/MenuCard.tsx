import type { Menu } from '../../types/menu';

import StatusBadge from './StatusBadge';

import {
  formatDate,
  getWeekLabel,
} from '../../utils/date';

interface Props {
  menu: Menu;
  onClick: () => void;
  onDelete: () => void;
}

export default function MenuCard({
  menu,
  onClick,
  onDelete,
}: Props) {
  return (
    <article className="menu-card">
      <div className="menu-card-header">
        <button
          className="menu-card-main"
          type="button"
          onClick={onClick}
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
        <StatusBadge status={menu.status} />
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
          onClick={onClick}
        >
          View menu
        </button>
      </div>
    </article>
  );
}