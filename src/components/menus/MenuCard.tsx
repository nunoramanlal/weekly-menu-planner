import type { Menu } from '../../types/menu';

import StatusBadge from './StatusBadge';

import {
  formatDate,
  getWeekLabel,
} from '../../utils/date';

interface Props {
  menu: Menu;
  onClick: () => void;
}

export default function MenuCard({
  menu,
  onClick,
}: Props) {
  return (
    <button
      className="menu-card"
      onClick={onClick}
    >
      <div className="menu-card-top">
        <StatusBadge status={menu.status} />

        <span className="menu-date">
          {formatDate(menu.week_start)}
        </span>
      </div>

      <h3>
        Week of {getWeekLabel(menu.week_start)}
      </h3>

      {menu.notes ? (
        <p>{menu.notes}</p>
      ) : (
        <p className="muted">
          No notes
        </p>
      )}
    </button>
  );
}