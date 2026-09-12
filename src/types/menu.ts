export type MenuStatus = 'current' | 'previous' | 'backlog';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type MealType = 'lunch' | 'dinner';

export interface Category {
  id: number;
  category: string;
}

export interface Dish {
  id: number;
  dish: string;
  category_id: number;
  category?: Category;
}

export interface Menu {
  id: number;
  week_start: string;
  status: MenuStatus;
  notes: string | null;
}

export interface MenuDay {
  id: number;
  menu_id: number;
  day_of_the_week: DayOfWeek;
  meal_type: MealType;
  dish_id: number | null;
  dish?: Dish;
}

export interface MenuWithDays extends Menu {
  menu_days: MenuDay[];
}

export interface MenuDayInput {
  dayOfTheWeek: DayOfWeek;
  mealType: MealType;
  dishId: number | null;
}

export interface CreateMenuInput {
  weekStart: string;
  status: MenuStatus;
  notes: string | null;
  days: MenuDayInput[];
}