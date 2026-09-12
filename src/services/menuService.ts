import { supabase } from '../utils/supabaseClient';
import type {
  CreateMenuInput,
  Menu,
  MenuDay,
  MenuWithDays,
} from '../types/menu';

export async function getMenus(): Promise<Menu[]> {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .order('week_start', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getMenu(
  menuId: number
): Promise<MenuWithDays> {
  const { data: menu, error: menuError } = await supabase
    .from('menus')
    .select('*')
    .eq('id', menuId)
    .single();

  if (menuError) {
    throw new Error(menuError.message);
  }

  const { data: menuDays, error: daysError } = await supabase
    .from('menu_days')
    .select(`
      id,
      menu_id,
      day_of_the_week,
      meal_type,
      dish_id,
      dish:dishes (
        id,
        dish,
        category_id
      )
    `)
    .eq('menu_id', menuId);

  if (daysError) {
    throw new Error(daysError.message);
  }

  return {
    ...menu,
    menu_days: menuDays ?? [],
  };
}

export async function createMenu(
  input: CreateMenuInput
): Promise<Menu> {
  const { data: menu, error: menuError } = await supabase
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