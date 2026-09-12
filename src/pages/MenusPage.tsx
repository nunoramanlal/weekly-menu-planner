import { useEffect, useState } from 'react';

import type {
  Dish,
  Menu,
  MenuWithDays,
} from '../types/menu';

import {
  deleteMenu,
  getMenu,
  getMenus,
} from '../services/menuService';

import { getDishes } from '../services/dishService';

import PageHeader from '../components/layout/PageHeader';
import MenuList from '../components/menus/MenuList';
import MenuModal from '../components/menus/MenuModal';
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

  const [selectedMenu, setSelectedMenu] =
    useState<MenuWithDays | null>(null);

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
      setDishes(dishData ?? []);
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

  async function handleSelect(menu: Menu) {
    try {
      setError(null);

      const fullMenu = await getMenu(menu.id);

      setSelectedMenu(fullMenu);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load menu.'
      );
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

      if (selectedMenu?.id === menu.id) {
        setSelectedMenu(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not delete menu.'
      );
    }
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
          onSelect={handleSelect}
          onCreate={onCreateMenu}
          onDelete={handleDelete}
        />
      )}

      <MenuModal
        menu={selectedMenu}
        dishes={dishes}
        onClose={() => setSelectedMenu(null)}
      />
    </>
  );
}