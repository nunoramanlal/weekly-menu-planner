import { supabase } from '../utils/supabaseClient';
import type { Dish } from '../types/menu';

export async function getDishes(): Promise<Dish[]> {
  const { data, error } = await supabase
    .from('dishes')
    .select(`
      id,
      dish,
      category_id,
      categories:category_id (
        id,
        category
      )
    `)
    .order('dish');

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    dish: item.dish,
    category_id: item.category_id,
    category: Array.isArray(item.categories)
      ? item.categories[0]
      : item.categories,
  }));
}

export async function createDish(
  dish: string,
  categoryId: number
): Promise<Dish> {
  const { data, error } = await supabase
    .from('dishes')
    .insert({
      dish: dish.trim(),
      category_id: categoryId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}