import type { Category, Dish } from '../../types/menu';

interface Props {
  dishes?: Dish[];
  categories?: Category[];
  onDelete: (dish: Dish) => void;
}

export default function DishList({
  dishes = [],
  categories = [],
  onDelete,
}: Props) {
  if (dishes.length === 0) {
    return (
      <div className="state-card">
        <h3>No dishes yet</h3>
        <p>
          Add your first dish to start building menus.
        </p>
      </div>
    );
  }

  return (
    <div className="data-list">
      {dishes.map((dish) => {
        const category = categories.find(
          (item) => item.id === dish.category_id
        );

        return (
          <div className="data-row" key={dish.id}>
            <div>
              <strong>{dish.dish}</strong>
            </div>

            <span className="data-tag">
              {category?.category ?? 'Uncategorized'}
            </span>

            <button
              className="icon-button danger-icon"
              type="button"
              onClick={() => onDelete(dish)}
              aria-label={`Delete ${dish.dish}`}
              title="Delete dish"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}