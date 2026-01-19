
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Inicialización segura: solo creamos el cliente si las credenciales existen
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Funciones de ayuda con manejo de errores y modo offline
export const db = {
  async getIngredients() {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('ingredients').select('*');
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase Error (Ingredients):", e);
      return null;
    }
  },

  async updateIngredient(ing: any) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('ingredients').upsert(ing);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase Sync Error (Update Ingredient):", e);
    }
  },

  async getProducts() {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase Error (Products):", e);
      return null;
    }
  },

  async saveSale(sale: any) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('sales').insert(sale);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase Sync Error (Save Sale):", e);
    }
  },

  async getSales() {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('sales').select('*');
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase Error (Sales):", e);
      return null;
    }
  },

  async saveTaxEntry(entry: any) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('tax_entries').insert(entry);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase Sync Error (Save Tax):", e);
    }
  },

  async getTaxEntries() {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('tax_entries').select('*');
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase Error (Tax Entries):", e);
      return null;
    }
  }
};
