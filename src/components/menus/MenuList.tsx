import type {
  Dish,
  Menu,
  MenuStatus,
  MenuWithDays,
} from '../../types/menu';

import MenuCard from './MenuCard';
import EmptyState from '../common/EmptyState';
import MenuDetails from './MenuDetails';

interface Props {
  menus: Menu[];
  dishes: Dish[];
  expandedMenuId: number | null;
  expandedMenu: MenuWithDays | null;
  expandedLoading: boolean;
  onToggle: (menu: Menu) => void;
  onCreate: () => void;
  onDelete: (menu: Menu) => void;
  onStatusChange: (menu: Menu, status: MenuStatus) => void;
  onSaveMeal: MenuWithDays extends never
    ? never
    : (
        id: number,
        updates: {
          dayOfTheWeek: import('../../types/menu').DayOfWeek;
          mealType: 'lunch' | 'dinner';
          dishId: number | null;
        }
      ) => Promise<void>;
  onDeleteMeal: (id: number) => Promise<void>;
}

export default function MenuList({
  menus,
  dishes,
  expandedMenuId,
  expandedMenu,
  expandedLoading,
  onToggle,
  onCreate,
  onDelete,
  onStatusChange,
  onSaveMeal,
  onDeleteMeal,
}: Props) {
  if (menus.length === 0) {
    return (
      <EmptyState
        title="No menus yet"
        description="Create your first weekly menu to get started."
        action={
          <button
            className="button primary"
            type="button"
            onClick={onCreate}
          >
            Create menu
          </button>
        }
      />
    );
  }

  return (
    <div className="menu-list">
      {menus.map((menu) => {
        const isExpanded = expandedMenuId === menu.id;

        return (
          <MenuCard
            key={menu.id}
            menu={menu}
            expanded={isExpanded}
            onToggle={() => onToggle(menu)}
            onDelete={() => onDelete(menu)}
            onStatusChange={(status) =>
              onStatusChange(menu, status)
            }
          >
            {isExpanded &&
              (expandedLoading ? (
                <p className="muted">Loading menu...</p>
              ) : (
                expandedMenu && (
                  <MenuDetails
                    menu={expandedMenu}
                    dishes={dishes}
                    onSave={onSaveMeal}
                    onDelete={onDeleteMeal}
                  />
                )
              ))}
          </MenuCard>
        );
      })}
    </div>
  );
}