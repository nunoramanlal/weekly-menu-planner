import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import type { Category, Dish } from '../types/menu';

import {
  createCategory,
  deleteCategory,
  getCategories,
} from '../services/categoryService';

import { getDishes } from '../services/dishService';

import PageHeader from '../components/layout/PageHeader';
import CategoryList from '../components/categories/CategoryList';
import Loading from '../components/common/Loading';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [dishes, setDishes] = useState<Dish[]>([]);

  const [categoryName, setCategoryName] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [categoryData, dishData] =
        await Promise.all([
          getCategories(),
          getDishes(),
        ]);

      setCategories(categoryData);
      setDishes(dishData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load categories.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!categoryName.trim()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const category = await createCategory(
        categoryName
      );

      setCategories((current) =>
        [...current, category].sort((a, b) =>
          a.category.localeCompare(b.category)
        )
      );

      setCategoryName('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not create category.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    const dishCount = dishes.filter(
      (dish) => dish.category_id === category.id
    ).length;

    if (dishCount > 0) {
      setError(
        `Cannot delete "${category.category}" because it has ${dishCount} ${
          dishCount === 1 ? 'dish' : 'dishes'
        }. Move or delete those dishes first.`
      );

      return;
    }

    const confirmed = window.confirm(
      `Delete "${category.category}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      await deleteCategory(category.id);

      setCategories((current) =>
        current.filter(
          (item) => item.id !== category.id
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not delete category.'
      );
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Categories"
        description="Organise your dishes by category."
      />

      {error && (
        <div className="error-card">
          {error}
        </div>
      )}

      <section className="form-card">
        <h2>Add category</h2>

        <form
          className="inline-form"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            value={categoryName}
            onChange={(event) =>
              setCategoryName(event.target.value)
            }
            placeholder="Category name"
          />

          <button
            className="button primary"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Adding...' : 'Add category'}
          </button>
        </form>
      </section>

      {loading ? (
        <Loading />
      ) : (
        <CategoryList
          categories={categories}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}