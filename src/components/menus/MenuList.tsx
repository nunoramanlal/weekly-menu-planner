import type { Menu } from '../../types/menu';

import MenuCard from './MenuCard';
import EmptyState from '../common/EmptyState';

interface Props {
  menus: Menu[];
  onSelect: (menu: Menu) => void;
  onCreate: () => void;
}

export default function MenuList({
  menus,
  onSelect,
  onCreate,
}: Props) {
  if (menus.length === 0) {
    return (
      <EmptyState
        title="No menus yet"
        description="Create your first weekly menu to get started."
        action={
          <button
            className="button primary"
            onClick={onCreate}
          >
            Create menu
          </button>
        }
      />
    );
  }

  return (
    <div className="menu-grid">
      {menus.map((menu) => (
        <MenuCard
          key={menu.id}
          menu={menu}
          onClick={() => onSelect(menu)}
        />
      ))}
    </div>
  );
}