import type {
  DayOfWeek,
  Dish,
  MenuWithDays,
} from '../../types/menu';

import { daysOfWeek, dayLabels } from '../../utils/menu';

import MealEditor from './MealEditor';

interface Props {
  menu: MenuWithDays;
  dishes: Dish[];
  onSave: (
    id: number,
    updates: {
      dayOfTheWeek: DayOfWeek;
      mealType: 'lunch' | 'dinner';
      dishId: number | null;
    }
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function MenuDetails({
  menu,
  dishes,
  onSave,
  onDelete,
}: Props) {
  return (
    <div className="meal-list">
      {daysOfWeek.map((day) => {
        const meals = menu.menu_days.filter(
          (item) => item.day_of_the_week === day
        );

        return (
          <div className="day-row" key={day}>
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
                    onSave={onSave}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}