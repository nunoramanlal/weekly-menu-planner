import type { Category } from '../../types/menu';

interface Props {
  categories?: Category[];
  onDelete: (category: Category) => void;
}

export default function CategoryList({
  categories = [],
  onDelete,
}: Props) {
  if (categories.length === 0) {
    return (
      <div className="state-card">
        <h3>No categories yet</h3>
        <p>
          Add your first category to organise your dishes.
        </p>
      </div>
    );
  }

  return (
    <div className="data-list">
      {categories.map((category) => {
        return (
          <div
            className="data-row"
            key={category.id}
          >
            <div>
              <strong>{category.category}</strong>
            </div>

            <button
              className="icon-button danger-icon"
              type="button"
              onClick={() => onDelete(category)}
              aria-label={`Delete ${category.category}`}
              title="Delete category"
            >
             ×
            </button>
          </div>
        );
      })}
    </div>
  );
}