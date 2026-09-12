import { supabase } from '../supabase';

import type {
  CreateMenuInput,
  DayOfWeek,
  MealType,
  Menu,
  MenuDay,
  MenuWithDays,
} from '../types/menu';

export async function getMenus(): Promise<Menu[]> {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .order('week_start', {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getMenu(
  menuId: number
): Promise<MenuWithDays> {
  const { data: menu, error: menuError } =
    await supabase
      .from('menus')
      .select('*')
      .eq('id', menuId)
      .single();

  if (menuError) {
    throw new Error(menuError.message);
  }

  const { data: menuDays, error: daysError } =
    await supabase
      .from('menu_days')
      .select(`
        id,
        menu_id,
        day_of_the_week,
        meal_type,
        dish_id,
        dishes (
          id,
          dish,
          category_id
        )
      `)
      .eq('menu_id', menuId);

  if (daysError) {
    throw new Error(daysError.message);
  }

  const normalizedDays: MenuDay[] = (menuDays ?? []).map(
    (row: any) => ({
      id: row.id,
      menu_id: row.menu_id,
      day_of_the_week: row.day_of_the_week,
      meal_type: row.meal_type,
      dish_id: row.dish_id,
      dish: Array.isArray(row.dishes)
        ? row.dishes[0]
        : row.dishes,
    })
  );

  return {
    ...menu,
    menu_days: normalizedDays,
  };
}

export async function createMenu(
  input: CreateMenuInput
): Promise<Menu> {
  const { data: menu, error: menuError } =
    await supabase
      .from('menus')
      .insert({
        week_start: input.weekStart,
        status: input.status,
        notes: input.notes,
      })
      .select()
      .single();

  if (menuError) {
    throw new Error(menuError.message);
  }

  const menuDays = input.days.map((day) => ({
    menu_id: menu.id,
    day_of_the_week: day.dayOfTheWeek,
    meal_type: day.mealType,
    dish_id: day.dishId,
  }));

  const { error: daysError } = await supabase
    .from('menu_days')
    .insert(menuDays);

  if (daysError) {
    throw new Error(
      `Menu created, but meals could not be saved: ${daysError.message}`
    );
  }

  return menu;
}

export async function updateMenuDay(
  id: number,
  updates: {
    dayOfTheWeek: DayOfWeek;
    mealType: MealType;
    dishId: number | null;
  }
): Promise<MenuDay> {
  const { data, error } = await supabase
    .from('menu_days')
    .update({
      day_of_the_week: updates.dayOfTheWeek,
      meal_type: updates.mealType,
      dish_id: updates.dishId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteMenuDay(
  id: number
): Promise<void> {
  const { error } = await supabase
    .from('menu_days')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}