import { createClient } from '@supabase/supabase-js';

// En Vite se usa import.meta.env o process.env si se configura en vite.config
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Solo creamos el cliente si tenemos las credenciales
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const db = {
  async getIngredients() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('ingredients').select('*').order('name');
    if (error) return null;
    return data;
  },
  async updateIngredient(ing: any) {
    if (!supabase) return;
    await supabase.from('ingredients').upsert(ing);
  },
  async getProducts() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('products').select('*').order('category');
    if (error) return null;
    return data;
  },
  async saveSale(sale: any) {
    if (!supabase) return;
    const { error } = await supabase.from('sales').insert(sale);
    if (error) console.error("Error saving sale:", error);
  },
  async getSales() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('sales').select('*').order('timestamp', { ascending: false });
    if (error) return null;
    return data;
  },
  async saveTaxEntry(entry: any) {
    if (!supabase) return;
    await supabase.from('tax_entries').insert(entry);
  },
  async getTaxEntries() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('tax_entries').select('*').order('date', { ascending: false });
    if (error) return null;
    return data;
  }
};