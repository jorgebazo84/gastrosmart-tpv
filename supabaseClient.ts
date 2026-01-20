
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Mapeador CamelCase -> snake_case
 * Convierte { amountPaid: 10 } en { amount_paid: 10 }
 */
const mapToDB = (obj: any) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const mapped: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Reemplaza mayúsculas por _minúscula
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      mapped[snakeKey] = obj[key];
    }
  }
  return mapped;
};

/**
 * Mapeador snake_case -> CamelCase
 * Convierte { amount_paid: 10 } en { amountPaid: 10 }
 */
const mapFromDB = (obj: any) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const mapped: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/([-_][a-z])/g, group => 
        group.toUpperCase().replace('-', '').replace('_', '')
      );
      mapped[camelKey] = obj[key];
    }
  }
  return mapped;
};

export const db = {
  // Ingredientes
  async getIngredients() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('ingredients').select('*').order('name');
    if (error) throw error;
    return data.map(mapFromDB);
  },
  async updateIngredient(ing: any) {
    if (!supabase) return;
    await supabase.from('ingredients').upsert(mapToDB(ing));
  },

  // Productos
  async getProducts() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('products').select('*').order('category');
    if (error) return null;
    return data.map(mapFromDB);
  },
  async updateProduct(prod: any) {
    if (!supabase) return;
    await supabase.from('products').upsert(mapToDB(prod));
  },

  // Usuarios
  async getUsers() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('users').select('*').order('name');
    if (error) return null;
    return data.map(mapFromDB);
  },
  async saveUser(user: any) {
    if (!supabase) return;
    await supabase.from('users').upsert(mapToDB(user));
  },

  // Ventas
  async saveSale(sale: any) {
    if (!supabase) return;
    // Forzamos el mapeo antes de insertar para evitar PGRST204
    const dbSale = mapToDB(sale);
    const { error } = await supabase.from('sales').insert(dbSale);
    if (error) {
      console.error("Supabase Sale Error:", error);
      throw error;
    }
  },
  async getSales() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('sales').select('*').order('timestamp', { ascending: false });
    if (error) return null;
    return data.map(mapFromDB);
  },

  // Fiscal
  async saveTaxEntry(entry: any) {
    if (!supabase) return;
    await supabase.from('tax_entries').insert(mapToDB(entry));
  },
  async getTaxEntries() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('tax_entries').select('*').order('date', { ascending: false });
    if (error) return null;
    return data.map(mapFromDB);
  },

  // Mermas
  async saveWaste(waste: any) {
    if (!supabase) return;
    await supabase.from('waste_entries').insert(mapToDB(waste));
  },
  async getWaste() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('waste_entries').select('*').order('timestamp', { ascending: false });
    if (error) return null;
    return data.map(mapFromDB);
  },

  // Turnos (Shifts)
  async getActiveShift() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('shifts').select('*').eq('status', 'abierto').maybeSingle();
    if (error) return null;
    return mapFromDB(data);
  },
  async saveShift(shift: any) {
    if (!supabase) return;
    const dbShift = mapToDB(shift);
    const { error } = await supabase.from('shifts').upsert(dbShift);
    if (error) {
      console.error("Supabase Shift Error:", error);
      throw error;
    }
  }
};