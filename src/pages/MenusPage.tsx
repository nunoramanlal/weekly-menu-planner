import { useEffect, useState } from 'react';

import type { DayOfWeek, Dish, MealType, Menu, MenuStatus, MenuWithDays } from '../types/menu';
import {
  deleteMenu,
  deleteMenuDay,
  getMenu,
  getMenus,
  updateMenuDay,
  updateMenuStatus,
} from '../services/menuService';
import { getDishes } from '../services/dishService';
import PageHeader from '../components/layout/PageHeader';
import MenuList from '../components/menus/MenuList';
import Loading from '../components/common/Loading';
import { sortMenus } from '../utils/menu';

interface Props {
  onCreateMenu: () => void;
}

export default function MenusPage({
  onCreateMenu,
}: Props) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);

  const [expandedMenuId, setExpandedMenuId] =
    useState<number | null>(null);

  const [expandedMenu, setExpandedMenu] =
    useState<MenuWithDays | null>(null);

  const [expandedLoading, setExpandedLoading] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [menuData, dishData] =
        await Promise.all([
          getMenus(),
          getDishes(),
        ]);

      setMenus(sortMenus(menuData));
      setDishes(dishData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load menus.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(menu: Menu) {
    if (expandedMenuId === menu.id) {
      setExpandedMenuId(null);
      setExpandedMenu(null);
      return;
    }

    setExpandedMenuId(menu.id);
    setExpandedMenu(null);

    try {
      setError(null);
      setExpandedLoading(true);

      const fullMenu = await getMenu(menu.id);

      setExpandedMenu(fullMenu);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load menu.'
      );
      setExpandedMenuId(null);
    } finally {
      setExpandedLoading(false);
    }
  }

  async function handleDelete(menu: Menu) {
    const confirmed = window.confirm(
      `Delete the menu for the week starting ${menu.week_start}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      await deleteMenu(menu.id);

      setMenus((current) =>
        current.filter(
          (item) => item.id !== menu.id
        )
      );

      if (expandedMenuId === menu.id) {
        setExpandedMenuId(null);
        setExpandedMenu(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not delete menu.'
      );
    }
  }

  async function handleStatusChange(
    menu: Menu,
    status: MenuStatus
  ) {
    if (status === menu.status) {
      return;
    }

    const previousMenus = menus;

    try {
      setError(null);

      await updateMenuStatus(menu, status, menus);

      setMenus((current) =>
        sortMenus(
          current.map((item) => {
            if (item.id === menu.id) {
              return { ...item, status };
            }

            if (
              status === 'current' &&
              item.status === 'current'
            ) {
              return { ...item, status: 'previous' };
            }

            if (
              status === 'current' &&
              item.status === 'previous'
            ) {
              return { ...item, status: 'backlog' };
            }

            return item;
          })
        )
      );

      if (expandedMenu?.id === menu.id) {
        setExpandedMenu((current) =>
          current ? { ...current, status } : current
        );
      }
    } catch (err) {
      setMenus(previousMenus);

      setError(
        err instanceof Error
          ? err.message
          : 'Could not update menu status.'
      );
    }
  }

  async function handleSaveMeal(
    id: number,
    updates: {
      dayOfTheWeek: DayOfWeek;
      mealType: MealType;
      dishId: number | null;
    }
  ) {
    const updated = await updateMenuDay(id, updates);

    setExpandedMenu((current) => {
      if (!current) {
        return current;
      }

      const updatedDish = dishes.find(
        (dish) => dish.id === updated.dish_id
      );

      return {
        ...current,
        menu_days: current.menu_days.map((day) =>
          day.id === id
            ? { ...day, ...updated, dish: updatedDish }
            : day
        ),
      };
    });
  }

  async function handleDeleteMeal(id: number) {
    await deleteMenuDay(id);

    setExpandedMenu((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        menu_days: current.menu_days.filter(
          (day) => day.id !== id
        ),
      };
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Weekly planner"
        title="Menus"
        description="Plan and manage your weekly meals."
        action={
          <button
            className="button primary"
            type="button"
            onClick={onCreateMenu}
          >
            + New menu
          </button>
        }
      />

      {loading && <Loading />}

      {!loading && error && (
        <div className="error-card">
          {error}
        </div>
      )}

      {!loading && !error && (
        <MenuList
          menus={menus}
          dishes={dishes}
          expandedMenuId={expandedMenuId}
          expandedMenu={expandedMenu}
          expandedLoading={expandedLoading}
          onToggle={handleToggle}
          onCreate={onCreateMenu}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onSaveMeal={handleSaveMeal}
          onDeleteMeal={handleDeleteMeal}
        />
      )}
    </>
  );
}