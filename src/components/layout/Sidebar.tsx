import type { Page } from '../../types/navigation';

interface Props {
  page: Page;
  onNavigate: (page: Page) => void;
}

const items: {
  page: Page;
  label: string;
}[] = [
  {
    page: 'menus',
    label: 'Menus',
  },
  {
    page: 'dishes',
    label: 'Dishes',
  },
  {
    page: 'categories',
    label: 'Categories',
  },
];

export default function Sidebar({
  page,
  onNavigate,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">WM</div>

        <div>
          <strong>Weekly Menu</strong>
          <span>Planner</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.page}
            className={
              page === item.page
                ? 'nav-item active'
                : 'nav-item'
            }
            onClick={() => onNavigate(item.page)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}