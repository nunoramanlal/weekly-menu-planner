import { supabase } from '../supabase';
import type { Dish } from '../types/menu';

export async function getDishes(): Promise<Dish[]> {
  const { data, error } = await supabase
    .from('dishes')
    .select('id, dish, category_id')
    .order('dish');

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
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

export async function deleteDish(id: number): Promise<void> {
  const { error } = await supabase
    .from('dishes')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}