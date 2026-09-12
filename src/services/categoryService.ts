import { supabase } from '../supabase';
import type { Category } from '../types/menu';

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('category');

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createCategory(
  category: string
): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      category: category.trim(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}