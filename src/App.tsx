import { useEffect, useState } from 'react';
import './App.css';

import {
  createCategory,
  getCategories,
} from './services/categoryService';

import {
  createDish,
  getDishes,
} from './services/dishService';

import {
  createMenu,
  getMenu,
  getMenus,
} from './services/menuService';

import type {
  Category,
  DayOfWeek,
  Dish,
  MealType,
  Menu,
  MenuDayInput,
  MenuStatus,
  MenuWithDays,
} from './types/menu';

type Page =
  | 'dashboard'
  | 'menus'
  | 'create-menu'
  | 'dishes'
  | 'categories';

const daysOfWeek: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const dayLabels: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

function getInitialDays(): MenuDayInput[] {
  return daysOfWeek.map((day) => ({
    dayOfTheWeek: day,
    mealType: 'dinner',
    dishId: null,
  }));
}

function App() {
  const [page, setPage] = useState<Page>('dashboard');

  const [menus, setMenus] = useState<Menu[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedMenu, setSelectedMenu] =
    useState<MenuWithDays | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const [menusData, dishesData, categoriesData] =
        await Promise.all([
          getMenus(),
          getDishes(),
          getCategories(),
        ]);

      setMenus(menusData);
      setDishes(dishesData);
      setCategories(categoriesData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function openMenu(menuId: number) {
    try {
      setError('');

      const menu = await getMenu(menuId);

      setSelectedMenu(menu);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load menu.'
      );
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading your menu planner...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🍽️</div>
          <div>
            <h1>Menu Planner</h1>
            <span>Weekly meals</span>
          </div>
        </div>

        <nav className="navigation">
          <NavItem
            active={page === 'dashboard'}
            onClick={() => setPage('dashboard')}
            icon="⌂"
            label="Dashboard"
          />

          <NavItem
            active={page === 'menus'}
            onClick={() => setPage('menus')}
            icon="▦"
            label="Menus"
          />

          <NavItem
            active={page === 'dishes'}
            onClick={() => setPage('dishes')}
            icon="🍴"
            label="Dishes"
          />

          <NavItem
            active={page === 'categories'}
            onClick={() => setPage('categories')}
            icon="◈"
            label="Categories"
          />
        </nav>

        <button
          className="create-menu-button"
          onClick={() => setPage('create-menu')}
        >
          <span>+</span>
          Create menu
        </button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">WEEKLY MENU PLANNER</p>
            <h2>
              {page === 'dashboard' && 'Dashboard'}
              {page === 'menus' && 'Your menus'}
              {page === 'create-menu' && 'Create a menu'}
              {page === 'dishes' && 'Dishes'}
              {page === 'categories' && 'Categories'}
            </h2>
          </div>

          <div className="topbar-date">
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <strong>Error</strong>
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {page === 'dashboard' && (
          <Dashboard
            menus={menus}
            dishes={dishes}
            onOpenMenu={openMenu}
            onCreateMenu={() => setPage('create-menu')}
          />
        )}

        {page === 'menus' && (
          <MenusPage
            menus={menus}
            onOpenMenu={openMenu}
            onCreateMenu={() => setPage('create-menu')}
          />
        )}

        {page === 'create-menu' && (
          <CreateMenuPage
            dishes={dishes}
            onCreated={async () => {
              await loadData();
              setPage('menus');
            }}
          />
        )}

        {page === 'dishes' && (
          <DishesPage
            dishes={dishes}
            categories={categories}
            onCreated={async () => {
              const [newDishes, newCategories] =
                await Promise.all([
                  getDishes(),
                  getCategories(),
                ]);

              setDishes(newDishes);
              setCategories(newCategories);
            }}
          />
        )}

        {page === 'categories' && (
          <CategoriesPage
            categories={categories}
            onCreated={async () => {
              setCategories(await getCategories());
            }}
          />
        )}

        {selectedMenu && (
          <MenuModal
            menu={selectedMenu}
            dishes={dishes}
            onClose={() => setSelectedMenu(null)}
          />
        )}
      </main>
    </div>
  );
}

function NavItem({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="nav-icon">{icon}</span>
      {label}
    </button>
  );
}

function Dashboard({
  menus,
  dishes,
  onOpenMenu,
  onCreateMenu,
}: {
  menus: Menu[];
  dishes: Dish[];
  onOpenMenu: (id: number) => void;
  onCreateMenu: () => void;
}) {
  const current = menus.find((menu) => menu.status === 'current');
  const previous = menus.find(
    (menu) => menu.status === 'previous'
  );

  const backlog = menus.filter(
    (menu) => menu.status === 'backlog'
  );

  return (
    <div className="page-content">
      <section className="hero">
        <div>
          <span className="hero-label">YOUR WEEK IN FOOD</span>
          <h3>
            Plan it once.
            <br />
            Enjoy it all week.
          </h3>
          <p>
            Keep your meals organised, discover your favourite
            dishes and stay ahead of the week.
          </p>
        </div>

        <button className="primary-button" onClick={onCreateMenu}>
          + Create weekly menu
        </button>
      </section>

      <div className="stats-grid">
        <StatCard
          label="Current menu"
          value={current ? formatDate(current.week_start) : '—'}
          icon="📅"
        />

        <StatCard
          label="Menus planned"
          value={menus.length}
          icon="🗓️"
        />

        <StatCard
          label="Dishes"
          value={dishes.length}
          icon="🍴"
        />

        <StatCard
          label="Backlog"
          value={backlog.length}
          icon="📚"
        />
      </div>

      <div className="section-header">
        <div>
          <span className="section-kicker">THIS WEEK</span>
          <h3>Current menu</h3>
        </div>
      </div>

      {current ? (
        <MenuCard
          menu={current}
          onClick={() => onOpenMenu(current.id)}
          featured
        />
      ) : (
        <EmptyState
          title="No current menu"
          text="Create your first weekly menu to get started."
          buttonText="Create menu"
          onClick={onCreateMenu}
        />
      )}

      {previous && (
        <>
          <div className="section-header section-spacing">
            <div>
              <span className="section-kicker">HISTORY</span>
              <h3>Previous menu</h3>
            </div>
          </div>

          <MenuCard
            menu={previous}
            onClick={() => onOpenMenu(previous.id)}
          />
        </>
      )}
    </div>
  );
}

function MenusPage({
  menus,
  onOpenMenu,
  onCreateMenu,
}: {
  menus: Menu[];
  onOpenMenu: (id: number) => void;
  onCreateMenu: () => void;
}) {
  return (
    <div className="page-content">
      <div className="page-actions">
        <div>
          <p className="muted">
            {menus.length} menu{menus.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button className="primary-button" onClick={onCreateMenu}>
          + Create menu
        </button>
      </div>

      {menus.length === 0 ? (
        <EmptyState
          title="No menus yet"
          text="Create your first weekly menu."
          buttonText="Create menu"
          onClick={onCreateMenu}
        />
      ) : (
        <div className="menu-list">
          {menus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              onClick={() => onOpenMenu(menu.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuCard({
  menu,
  onClick,
  featured = false,
}: {
  menu: Menu;
  onClick: () => void;
  featured?: boolean;
}) {
  return (
    <button
      className={`menu-card ${featured ? 'featured' : ''}`}
      onClick={onClick}
    >
      <div className="menu-card-date">
        <span>{getWeekLabel(menu.week_start)}</span>
        <strong>{formatDate(menu.week_start)}</strong>
      </div>

      <div className="menu-card-content">
        <div className="status-row">
          <StatusBadge status={menu.status} />
        </div>

        {menu.notes && (
          <p className="menu-notes">{menu.notes}</p>
        )}
      </div>

      <span className="arrow">→</span>
    </button>
  );
}

function StatusBadge({ status }: { status: MenuStatus }) {
  return (
    <span className={`status status-${status}`}>
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function CreateMenuPage({
  dishes,
  onCreated,
}: {
  dishes: Dish[];
  onCreated: () => Promise<void>;
}) {
  const [weekStart, setWeekStart] = useState('');
  const [status, setStatus] =
    useState<MenuStatus>('backlog');
  const [notes, setNotes] = useState('');
  const [days, setDays] = useState<MenuDayInput[]>(
    getInitialDays()
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function updateDish(
    day: DayOfWeek,
    mealType: MealType,
    dishId: number | null
  ) {
    setDays((current) =>
      current.map((item) =>
        item.dayOfTheWeek === day &&
        item.mealType === mealType
          ? { ...item, dishId }
          : item
      )
    );
  }

  function addLunch(day: DayOfWeek) {
    setDays((current) => {
      if (
        current.some(
          (item) =>
            item.dayOfTheWeek === day &&
            item.mealType === 'lunch'
        )
      ) {
        return current;
      }

      return [
        ...current,
        {
          dayOfTheWeek: day,
          mealType: 'lunch',
          dishId: null,
        },
      ];
    });
  }

  function removeLunch(day: DayOfWeek) {
    setDays((current) =>
      current.filter(
        (item) =>
          !(
            item.dayOfTheWeek === day &&
            item.mealType === 'lunch'
          )
      )
    );
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!weekStart) {
      setError('Please select a week.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await createMenu({
        weekStart,
        status,
        notes: notes.trim() || null,
        days,
      });

      await onCreated();
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
    <div className="page-content">
      <form
        className="create-menu-form"
        onSubmit={handleSubmit}
      >
        <div className="form-card">
          <div className="form-card-header">
            <div>
              <span className="section-kicker">
                MENU DETAILS
              </span>
              <h3>Weekly menu</h3>
            </div>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Week starting</span>
              <input
                type="date"
                value={weekStart}
                onChange={(event) =>
                  setWeekStart(event.target.value)
                }
              />
            </label>

            <label className="field">
              <span>Status</span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as MenuStatus
                  )
                }
              >
                <option value="backlog">Backlog</option>
                <option value="previous">Previous</option>
                <option value="current">Current</option>
              </select>
            </label>

            <label className="field full-width">
              <span>Notes</span>
              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="Anything to remember about this week..."
                rows={3}
              />
            </label>
          </div>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <div>
              <span className="section-kicker">
                MEALS
              </span>
              <h3>Plan your week</h3>
            </div>

            <span className="muted">
              Dinner is added by default
            </span>
          </div>

          <div className="week-editor">
            {daysOfWeek.map((day) => {
              const dinner = days.find(
                (item) =>
                  item.dayOfTheWeek === day &&
                  item.mealType === 'dinner'
              );

              const lunch = days.find(
                (item) =>
                  item.dayOfTheWeek === day &&
                  item.mealType === 'lunch'
              );

              return (
                <div className="day-editor" key={day}>
                  <div className="day-name">
                    {dayLabels[day]}
                  </div>

                  <MealEditor
                    label="Dinner"
                    value={dinner?.dishId ?? null}
                    dishes={dishes}
                    onChange={(value) =>
                      updateDish(
                        day,
                        'dinner',
                        value
                      )
                    }
                  />

                  {lunch ? (
                    <div className="meal-row">
                      <MealEditor
                        label="Lunch"
                        value={lunch.dishId}
                        dishes={dishes}
                        onChange={(value) =>
                          updateDish(
                            day,
                            'lunch',
                            value
                          )
                        }
                      />

                      <button
                        type="button"
                        className="remove-button"
                        onClick={() =>
                          removeLunch(day)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="add-lunch"
                      onClick={() => addLunch(day)}
                    >
                      + Add lunch
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="inline-error">{error}</div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="primary-button large"
            disabled={saving}
          >
            {saving ? 'Creating menu...' : 'Create menu'}
          </button>
        </div>
      </form>
    </div>
  );
}

function MealEditor({
  label,
  value,
  dishes,
  onChange,
}: {
  label: string;
  value: number | null;
  dishes: Dish[];
  onChange: (value: number | null) => void;
}) {
  return (
    <div className="meal-editor">
      <span>{label}</span>

      <select
        value={value ?? ''}
        onChange={(event) => {
          const newValue = event.target.value;

          onChange(
            newValue === '' ? null : Number(newValue)
          );
        }}
      >
        <option value="">Not decided yet</option>

        {dishes.map((dish) => (
          <option key={dish.id} value={dish.id}>
            {dish.dish}
          </option>
        ))}
      </select>
    </div>
  );
}

function DishesPage({
  dishes,
  categories,
  onCreated,
}: {
  dishes: Dish[];
  categories: Category[];
  onCreated: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [dish, setDish] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!dish.trim() || !categoryId) {
      setError('Enter a dish name and choose a category.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await createDish(
        dish,
        Number(categoryId)
      );

      setDish('');
      setCategoryId('');
      setShowForm(false);

      await onCreated();
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

  return (
    <div className="page-content">
      <div className="page-actions">
        <div>
          <p className="muted">
            {dishes.length} dish
            {dishes.length !== 1 ? 'es' : ''}
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          + Add dish
        </button>
      </div>

      {showForm && (
        <form
          className="small-form-card"
          onSubmit={handleSubmit}
        >
          <h3>Add a dish</h3>

          <div className="form-grid">
            <label className="field">
              <span>Dish name</span>
              <input
                value={dish}
                onChange={(event) =>
                  setDish(event.target.value)
                }
                placeholder="e.g. Chicken Tikka Masala"
              />
            </label>

            <label className="field">
              <span>Category</span>
              <select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
              >
                <option value="">
                  Select a category
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
            </label>
          </div>

          {error && (
            <div className="inline-error">{error}</div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? 'Adding...' : 'Add dish'}
            </button>
          </div>
        </form>
      )}

      <div className="dish-grid">
        {dishes.map((dish) => (
          <div className="dish-card" key={dish.id}>
            <div className="dish-icon">🍽️</div>

            <div>
              <h3>{dish.dish}</h3>

              <span className="category-pill">
                {dish.category?.category ??
                  'Uncategorised'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoriesPage({
  categories,
  onCreated,
}: {
  categories: Category[];
  onCreated: () => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      await createCategory(name);

      setName('');
      await onCreated();
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

  return (
    <div className="page-content">
      <div className="two-column">
        <div className="form-card">
          <span className="section-kicker">
            NEW CATEGORY
          </span>

          <h3>Add category</h3>

          <form onSubmit={handleSubmit}>
            <label className="field">
              <span>Category name</span>
              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Portuguese"
              />
            </label>

            {error && (
              <div className="inline-error">{error}</div>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? 'Adding...' : 'Add category'}
            </button>
          </form>
        </div>

        <div className="form-card">
          <span className="section-kicker">
            YOUR CATEGORIES
          </span>

          <h3>{categories.length} categories</h3>

          <div className="category-list">
            {categories.map((category) => (
              <div
                className="category-list-item"
                key={category.id}
              >
                <span>{category.category}</span>
                <span>→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuModal({
  menu,
  onClose,
}: {
  menu: MenuWithDays;
  dishes: Dish[];
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="section-kicker">
              {getWeekLabel(menu.week_start)}
            </span>
            <h3>{formatDate(menu.week_start)}</h3>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <StatusBadge status={menu.status} />

        {menu.notes && (
          <div className="modal-notes">
            {menu.notes}
          </div>
        )}

        <div className="menu-detail">
          {daysOfWeek.map((day) => {
            const meals = menu.menu_days.filter(
              (item) =>
                item.day_of_the_week === day
            );

            return (
              <div className="menu-detail-day" key={day}>
                <strong>{dayLabels[day]}</strong>

                <div>
                  {meals.length === 0 ? (
                    <span className="not-planned">
                      Not planned
                    </span>
                  ) : (
                    meals.map((meal) => (
                      <div
                        className="detail-meal"
                        key={meal.id}
                      >
                        <span>{meal.meal_type}</span>

                        <strong>
                          {meal.dish?.dish ??
                            'Not decided yet'}
                        </strong>
                      </div>
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

function EmptyState({
  title,
  text,
  buttonText,
  onClick,
}: {
  title: string;
  text: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🍽️</div>
      <h3>{title}</h3>
      <p>{text}</p>
      <button
        className="secondary-button"
        onClick={onClick}
      >
        {buttonText}
      </button>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getWeekLabel(date: string) {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);

  end.setDate(start.getDate() + 6);

  const startLabel = start.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  const endLabel = end.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `${startLabel} – ${endLabel}`;
}

export default App;