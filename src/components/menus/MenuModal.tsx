import { useEffect, useState } from 'react';

import type {
  DayOfWeek,
  Dish,
  MenuWithDays,
} from '../../types/menu';

import {
  dayLabels,
} from '../../utils/menu';

import {
  formatDate,
  getWeekLabel,
} from '../../utils/date';

import StatusBadge from './StatusBadge';

import {
  deleteMenuDay,
  updateMenuDay,
} from '../../services/menuService';

import MealEditor from './MealEditor';

interface Props {
  menu: MenuWithDays | null;
  dishes: Dish[];
  onClose: () => void;
}

const days: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export default function MenuModal({
  menu,
  dishes,
  onClose,
}: Props) {
  const [currentMenu, setCurrentMenu] =
    useState<MenuWithDays | null>(menu);

  useEffect(() => {
    setCurrentMenu(menu);
  }, [menu]);

  if (!currentMenu) {
    return null;
  }

  async function handleSave(
    id: number,
    updates: {
      dayOfTheWeek: DayOfWeek;
      mealType: 'lunch' | 'dinner';
      dishId: number | null;
    }
  ) {
    const updated = await updateMenuDay(
      id,
      updates
    );

    setCurrentMenu((current) => {
      if (!current) {
        return current;
      }

      const updatedDish = dishes.find(
        (dish) => dish.id === updated.dish_id
      );

      return {
        ...current,
        menu_days: current.menu_days.map(
          (day) =>
            day.id === id
              ? {
                  ...day,
                  ...updated,
                  dish: updatedDish,
                }
              : day
        ),
      };
    });
  }

  async function handleDelete(id: number) {
    await deleteMenuDay(id);

    setCurrentMenu((current) => {
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
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            <div className="eyebrow">
              {getWeekLabel(
                currentMenu.week_start
              )}
            </div>

            <h2>
              Week starting{' '}
              {formatDate(
                currentMenu.week_start
              )}
            </h2>
          </div>

          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-meta">
          <StatusBadge
            status={currentMenu.status}
          />

          {currentMenu.notes && (
            <p>{currentMenu.notes}</p>
          )}
        </div>

        <div className="meal-list">
          {days.map((day) => {
            const meals =
              currentMenu.menu_days.filter(
                (item) =>
                  item.day_of_the_week === day
              );

            return (
              <div
                className="day-row"
                key={day}
              >
                <div className="day-name">
                  {dayLabels[day]}
                </div>

                <div className="day-meals">
                  {meals.length === 0 ? (
                    <span className="muted">
                      No meals planned
                    </span>
                  ) : (
                    meals.map((meal) => (
                      <MealEditor
                        key={meal.id}
                        menuDay={meal}
                        dishes={dishes}
                        onSave={handleSave}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
