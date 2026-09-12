import { useEffect, useState } from 'react';

import type {
  DayOfWeek,
  Dish,
  MealType,
  MenuDay,
} from '../../types/menu';

interface Props {
  menuDay: MenuDay;
  dishes: Dish[];
  onSave: (
    id: number,
    updates: {
      dayOfTheWeek: DayOfWeek;
      mealType: MealType;
      dishId: number | null;
    }
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const days: {
  value: DayOfWeek;
  label: string;
}[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export default function MealEditor({
  menuDay,
  dishes,
  onSave,
  onDelete,
}: Props) {
  const [day, setDay] = useState<DayOfWeek>(
    menuDay.day_of_the_week
  );

  const [mealType, setMealType] = useState<MealType>(
    menuDay.meal_type
  );

  const [dishId, setDishId] = useState(
    menuDay.dish_id?.toString() ?? ''
  );

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDay(menuDay.day_of_the_week);
    setMealType(menuDay.meal_type);
    setDishId(menuDay.dish_id?.toString() ?? '');
  }, [menuDay]);

  async function handleSave() {
    try {
      setSaving(true);

      await onSave(menuDay.id, {
        dayOfTheWeek: day,
        mealType,
        dishId: dishId
          ? Number(dishId)
          : null,
      });

      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      'Remove this meal from the menu?'
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);

    try {
      await onDelete(menuDay.id);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    const dish = dishes.find(
      (item) => item.id === menuDay.dish_id
    );

    return (
      <div className="data-row">
        <div>
          <strong>
            {days.find((item) => item.value === day)?.label}
          </strong>

          <span className="muted">
            {menuDay.meal_type === 'lunch'
              ? 'Lunch'
              : 'Dinner'}
          </span>
        </div>

        <div>
          {dish?.dish ?? 'Not decided yet'}
        </div>

        <div className="button-row">
          <button
            className="button secondary small"
            type="button"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>

          <button
            className="icon-button danger-icon"
            type="button"
            onClick={handleDelete}
            disabled={saving}
            aria-label="Remove meal"
            title="Remove meal"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="data-row editing-row">
      <select
        value={day}
        onChange={(event) =>
          setDay(event.target.value as DayOfWeek)
        }
      >
        {days.map((item) => (
          <option
            key={item.value}
            value={item.value}
          >
            {item.label}
          </option>
        ))}
      </select>

      <select
        value={mealType}
        onChange={(event) =>
          setMealType(
            event.target.value as MealType
          )
        }
      >
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
      </select>

      <select
        value={dishId}
        onChange={(event) =>
          setDishId(event.target.value)
        }
      >
        <option value="">
          Not decided yet
        </option>

        {dishes.map((dish) => (
          <option
            key={dish.id}
            value={dish.id}
          >
            {dish.dish}
          </option>
        ))}
      </select>

      <div className="button-row">
        <button
          className="button primary small"
          type="button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>

        <button
          className="button secondary small"
          type="button"
          onClick={() => setEditing(false)}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}