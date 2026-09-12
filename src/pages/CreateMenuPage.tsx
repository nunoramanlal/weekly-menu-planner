import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import type {
  CreateMenuInput,
  DayOfWeek,
  Dish,
  MealType,
} from '../types/menu';

import { createMenu } from '../services/menuService';
import { getDishes } from '../services/dishService';

import PageHeader from '../components/layout/PageHeader';
import Loading from '../components/common/Loading';

interface Props {
  onCancel: () => void;
  onCreated: () => void;
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

function getMonday(date: Date): string {
  const result = new Date(date);
  const day = result.getDay();

  const difference =
    day === 0 ? -6 : 1 - day;

  result.setDate(
    result.getDate() + difference
  );

  return result.toISOString().slice(0, 10);
}

export default function CreateMenuPage({
  onCancel,
  onCreated,
}: Props) {
  const [dishes, setDishes] = useState<Dish[]>([]);

  const [weekStart, setWeekStart] =
    useState(getMonday(new Date()));

  const [notes, setNotes] = useState('');

  const [meals, setMeals] = useState<
    Record<DayOfWeek, number | null>
  >({
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  });

  const [mealTypes, setMealTypes] = useState<
    Record<DayOfWeek, MealType>
  >({
    monday: 'dinner',
    tuesday: 'dinner',
    wednesday: 'dinner',
    thursday: 'dinner',
    friday: 'dinner',
    saturday: 'dinner',
    sunday: 'dinner',
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    loadDishes();
  }, []);

  async function loadDishes() {
    try {
      setLoading(true);
      setError(null);

      const data = await getDishes();

      setDishes(data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load dishes.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleDishChange(
    day: DayOfWeek,
    value: string
  ) {
    setMeals((current) => ({
      ...current,
      [day]: value
        ? Number(value)
        : null,
    }));
  }

  function handleMealTypeChange(
    day: DayOfWeek,
    value: MealType
  ) {
    setMealTypes((current) => ({
      ...current,
      [day]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const daysInput: CreateMenuInput['days'] =
        days.map((day) => ({
          dayOfTheWeek: day.value,
          mealType: mealTypes[day.value],
          dishId: meals[day.value],
        }));

      await createMenu({
        weekStart,
        status: 'backlog',
        notes: notes.trim() || null,
        days: daysInput,
      });

      onCreated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not create menu.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Weekly planner"
        title="Create menu"
        description="Build a new weekly meal plan."
      />

      {error && (
        <div className="error-card">
          {error}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <form
          className="form-card create-menu-form"
          onSubmit={handleSubmit}
        >
          <div className="form-section">
            <h2>Menu details</h2>

            <label>
              <span>Week starting</span>

              <input
                type="date"
                value={weekStart}
                onChange={(event) =>
                  setWeekStart(
                    event.target.value
                  )
                }
                required
              />
            </label>

            <label>
              <span>Notes</span>

              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="Optional notes for this menu"
                rows={3}
              />
            </label>
          </div>

          <div className="form-section">
            <h2>Meals</h2>

            <div className="create-meal-list">
              {days.map((day) => (
                <div
                  className="create-meal-row"
                  key={day.value}
                >
                  <strong>
                    {day.label}
                  </strong>

                  <select
                    value={
                      mealTypes[day.value]
                    }
                    onChange={(event) =>
                      handleMealTypeChange(
                        day.value,
                        event.target
                          .value as MealType
                      )
                    }
                  >
                    <option value="dinner">
                      Dinner
                    </option>

                    <option value="lunch">
                      Lunch
                    </option>
                  </select>

                  <select
                    value={
                      meals[day.value] ?? ''
                    }
                    onChange={(event) =>
                      handleDishChange(
                        day.value,
                        event.target.value
                      )
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
                </div>
              ))}
            </div>
          </div>

          <div className="button-row">
            <button
              className="button secondary"
              type="button"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              className="button primary"
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Creating...'
                : 'Create menu'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}