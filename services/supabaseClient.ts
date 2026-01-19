import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const db = {
  // Ingredientes
  async getIngredients() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('ingredients').select('*').order('name');
    if (error) throw error;
    return data;
  },
  async updateIngredient(ing: any) {
    if (!supabase) return;
    await supabase.from('ingredients').upsert(ing);
  },

  // Productos
  async getProducts() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('products').select('*').order('category');
    if (error) return null;
    return data;
  },
  async updateProduct(prod: any) {
    if (!supabase) return;
    await supabase.from('products').upsert(prod);
  },

  // Usuarios
  async getUsers() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('users').select('*').order('name');
    if (error) return null;
    return data;
  },
  async saveUser(user: any) {
    if (!supabase) return;
    await supabase.from('users').upsert(user);
  },
  async deleteUser(id: string) {
    if (!supabase) return;
    await supabase.from('users').delete().eq('id', id);
  },

  // Ventas
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

  // Fiscal
  async saveTaxEntry(entry: any) {
    if (!supabase) return;
    await supabase.from('tax_entries').insert(entry);
  },
  async getTaxEntries() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('tax_entries').select('*').order('date', { ascending: false });
    if (error) return null;
    return data;
  },

  // Mermas
  async saveWaste(waste: any) {
    if (!supabase) return;
    await supabase.from('waste_entries').insert(waste);
  },
  async getWaste() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('waste_entries').select('*').order('timestamp', { ascending: false });
    if (error) return null;
    return data;
  },

  // Turnos (Shifts)
  async getActiveShift() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('shifts').select('*').eq('status', 'abierto').maybeSingle();
    if (error) return null;
    return data;
  },
  async saveShift(shift: any) {
    if (!supabase) return;
    await supabase.from('shifts').upsert(shift);
  }
};