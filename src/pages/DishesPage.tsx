import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';

import type {
  Category,
  Dish,
} from '../types/menu';

import {
  createDish,
  deleteDish,
  getDishes,
} from '../services/dishService';

import {
  getCategories,
} from '../services/categoryService';

import PageHeader from '../components/layout/PageHeader';
import DishList from '../components/dishes/DishList';
import Loading from '../components/common/Loading';

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [dishName, setDishName] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [filterCategoryId, setFilterCategoryId] =
    useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [dishData, categoryData] =
        await Promise.all([
          getDishes(),
          getCategories(),
        ]);

      setDishes(dishData);
      setCategories(categoryData);
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

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!dishName.trim()) {
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const dish = await createDish(
        dishName,
        Number(categoryId)
      );

      setDishes((current) =>
        [...current, dish].sort((a, b) =>
          a.dish.localeCompare(b.dish)
        )
      );

      setDishName('');
      setCategoryId('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not create dish.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(dish: Dish) {
    const confirmed = window.confirm(
      `Delete "${dish.dish}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      await deleteDish(dish.id);

      setDishes((current) =>
        current.filter(
          (item) => item.id !== dish.id
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not delete dish.'
      );
    }
  }

  const filteredDishes = useMemo(() => {
    if (!filterCategoryId) {
      return dishes;
    }

    return dishes.filter(
      (dish) =>
        dish.category_id ===
        Number(filterCategoryId)
    );
  }, [dishes, filterCategoryId]);

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Dishes"
        description="Manage the dishes available for your menus."
      />

      {error && (
        <div className="error-card">
          {error}
        </div>
      )}

      <section className="form-card">
        <h2>Add dish</h2>

        <form
          className="inline-form"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            value={dishName}
            onChange={(event) =>
              setDishName(event.target.value)
            }
            placeholder="Dish name"
          />

          <select
            value={categoryId}
            onChange={(event) =>
              setCategoryId(event.target.value)
            }
          >
            <option value="">
              Select category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.category}
              </option>
            ))}
          </select>

          <button
            className="button primary"
            type="submit"
            disabled={saving}
          >
            {saving
              ? 'Adding...'
              : 'Add dish'}
          </button>
        </form>
      </section>

      <section className="form-card">
        <h2>Filter dishes</h2>

        <select
          value={filterCategoryId}
          onChange={(event) =>
            setFilterCategoryId(
              event.target.value
            )
          }
        >
          <option value="">
            All categories
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.category}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <Loading />
      ) : (
        <DishList
          dishes={filteredDishes}
          categories={categories}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}