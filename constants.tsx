
import { Ingredient, Product, User, Table } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Carlos (Dueño)', role: 'admin', pin: '1234' },
  { id: 'u2', name: 'Laura', role: 'vendedor', pin: '0000' },
  { id: 'u3', name: 'Marcos', role: 'vendedor', pin: '1111' },
];

export const INITIAL_TABLES: Table[] = [
  { id: 't1', number: '1', zone: 'interior', status: 'libre', currentOrder: [] },
  { id: 't2', number: '2', zone: 'interior', status: 'libre', currentOrder: [] },
  { id: 't3', number: '3', zone: 'interior', status: 'libre', currentOrder: [] },
  { id: 't4', number: '4', zone: 'interior', status: 'libre', currentOrder: [] },
  { id: 't10', number: 'T1', zone: 'terraza', status: 'libre', currentOrder: [] },
  { id: 't11', number: 'T2', zone: 'terraza', status: 'libre', currentOrder: [] },
  { id: 't12', number: 'T3', zone: 'terraza', status: 'libre', currentOrder: [] },
  { id: 'b1', number: 'B1', zone: 'barra', status: 'libre', currentOrder: [] },
  { id: 'b2', number: 'B2', zone: 'barra', status: 'libre', currentOrder: [] },
  { id: 'b3', number: 'B3', zone: 'barra', status: 'libre', currentOrder: [] },
];

export const INITIAL_INGREDIENTS: Ingredient[] = [
  // BEBIDAS BASE (STOCK LÍQUIDO O UNIDADES)
  { id: 'ing_cerveza', name: 'Cerveza (Barril 50L)', stock: 50, unit: 'L', minStock: 15, costPerUnit: 2.10 },
  { id: 'ing_vino_tinto', name: 'Vino Tinto (Rioja 0.75L)', stock: 24, unit: 'unid', minStock: 6, costPerUnit: 6.50 },
  { id: 'ing_vino_blanco', name: 'Vino Blanco (Rueda 0.75L)', stock: 12, unit: 'unid', minStock: 4, costPerUnit: 5.80 },
  { id: 'ing_refresco_cola', name: 'Coca-Cola (Botella 0.2L)', stock: 120, unit: 'unid', minStock: 24, costPerUnit: 0.85 },
  { id: 'ing_refresco_cola_zero', name: 'Coca-Cola Zero (Botella 0.2L)', stock: 80, unit: 'unid', minStock: 24, costPerUnit: 0.85 },
  { id: 'ing_fanta_nar', name: 'Fanta Naranja (Botella 0.2L)', stock: 60, unit: 'unid', minStock: 12, costPerUnit: 0.80 },
  { id: 'ing_fanta_lim', name: 'Fanta Limón (Botella 0.2L)', stock: 60, unit: 'unid', minStock: 12, costPerUnit: 0.80 },
  { id: 'ing_sprite', name: 'Sprite (Botella 0.2L)', stock: 40, unit: 'unid', minStock: 10, costPerUnit: 0.80 },
  { id: 'ing_tonica', name: 'Tónica Schweppes (Botella 0.2L)', stock: 100, unit: 'unid', minStock: 20, costPerUnit: 0.90 },
  { id: 'ing_agua_05', name: 'Agua Mineral (0.5L)', stock: 200, unit: 'unid', minStock: 50, costPerUnit: 0.25 },

  // DESTILADOS (PARA COMBINADOS) - 1 botella = 0.7L = 14 copas de 0.05L
  { id: 'ing_gin_beefeater', name: 'Gin Beefeater (0.7L)', stock: 5, unit: 'unid', minStock: 1, costPerUnit: 14.50 },
  { id: 'ing_gin_tanqueray', name: 'Gin Tanqueray (0.7L)', stock: 4, unit: 'unid', minStock: 1, costPerUnit: 16.20 },
  { id: 'ing_ron_barcelo', name: 'Ron Barceló (0.7L)', stock: 6, unit: 'unid', minStock: 1, costPerUnit: 15.80 },
  { id: 'ing_ron_brugal', name: 'Ron Brugal (0.7L)', stock: 4, unit: 'unid', minStock: 1, costPerUnit: 15.80 },
  { id: 'ing_whisky_jb', name: 'Whisky J&B (0.7L)', stock: 5, unit: 'unid', minStock: 1, costPerUnit: 13.90 },
  { id: 'ing_whisky_ballantines', name: 'Whisky Ballantine\'s (0.7L)', stock: 5, unit: 'unid', minStock: 1, costPerUnit: 14.50 },
  { id: 'ing_vodka_absolut', name: 'Vodka Absolut (0.7L)', stock: 3, unit: 'unid', minStock: 1, costPerUnit: 16.00 },

  // ALIMENTACIÓN
  { id: 'ing_cafe', name: 'Café Grano (1kg)', stock: 10, unit: 'kg', minStock: 2, costPerUnit: 18.00 },
  { id: 'ing_leche', name: 'Leche (1L)', stock: 40, unit: 'L', minStock: 6, costPerUnit: 0.90 },
  { id: 'ing_pan_hamb', name: 'Pan Burger Brioche', stock: 50, unit: 'unid', minStock: 10, costPerUnit: 0.45 },
  { id: 'ing_pan_barra', name: 'Pan de Barra (Baguette)', stock: 30, unit: 'unid', minStock: 5, costPerUnit: 0.40 },
  { id: 'ing_carne_hamb', name: 'Carne Ternera (180g)', stock: 40, unit: 'unid', minStock: 10, costPerUnit: 1.80 },
  { id: 'ing_queso_cheddar', name: 'Queso Cheddar (Loncha)', stock: 100, unit: 'unid', minStock: 20, costPerUnit: 0.15 },
  { id: 'ing_huevos', name: 'Huevos (Cartón 30)', stock: 4, unit: 'unid', minStock: 1, costPerUnit: 4.80 },
  { id: 'ing_patatas_congeladas', name: 'Patatas Fritas (Bolsa 2.5kg)', stock: 10, unit: 'unid', minStock: 2, costPerUnit: 5.20 },
  { id: 'ing_calamares', name: 'Calamares Limpios (kg)', stock: 5, unit: 'kg', minStock: 1, costPerUnit: 12.00 },
  { id: 'ing_jamon_iberico', name: 'Jamón Ibérico (kg)', stock: 3, unit: 'kg', minStock: 0.5, costPerUnit: 45.00 },
];

export const INITIAL_PRODUCTS: Product[] = [
  // --- CAFETERÍA ---
  { id: 'p_cafe_solo', name: 'Café Solo', category: 'Cafés', price: 1.40, imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_cafe', quantity: 0.008 }] },
  { id: 'p_cafe_leche', name: 'Café con Leche', category: 'Cafés', price: 1.60, imageUrl: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_cafe', quantity: 0.008 }, { ingredientId: 'ing_leche', quantity: 0.15 }] },
  { id: 'p_capuchino', name: 'Capuchino', category: 'Cafés', price: 2.20, imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_cafe', quantity: 0.008 }, { ingredientId: 'ing_leche', quantity: 0.25 }] },
  
  // --- REFRESCOS Y AGUAS ---
  { id: 'p_cola', name: 'Coca-Cola', category: 'Refrescos', price: 2.50, imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_refresco_cola', quantity: 1 }] },
  { id: 'p_cola_zero', name: 'Coca-Cola Zero', category: 'Refrescos', price: 2.50, imageUrl: 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_refresco_cola_zero', quantity: 1 }] },
  { id: 'p_fanta_nar', name: 'Fanta Naranja', category: 'Refrescos', price: 2.40, imageUrl: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_fanta_nar', quantity: 1 }] },
  { id: 'p_tonica', name: 'Tónica Schweppes', category: 'Refrescos', price: 2.60, imageUrl: 'https://images.unsplash.com/photo-1623938786481-996025345701?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_tonica', quantity: 1 }] },
  { id: 'p_agua_peq', name: 'Agua Mineral 0.5L', category: 'Refrescos', price: 1.50, imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_agua_05', quantity: 1 }] },

  // --- CERVEZAS ---
  { id: 'p_caña', name: 'Caña de Cerveza', category: 'Cervezas', price: 1.80, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_cerveza', quantity: 0.20 }] },
  { id: 'p_doble', name: 'Doble de Cerveza', category: 'Cervezas', price: 2.80, imageUrl: 'https://images.unsplash.com/photo-1532634896-26909d0d4b89?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_cerveza', quantity: 0.35 }] },
  { id: 'p_jarra', name: 'Jarra 0.5L', category: 'Cervezas', price: 4.50, imageUrl: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_cerveza', quantity: 0.50 }] },

  // --- COMBINADOS (Lógica Especial en POS) ---
  { id: 'p_gin_beefeater', name: 'Gin Beefeater + Refresco', category: 'Combinados', price: 8.50, imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_gin_beefeater', quantity: 0.071 }] }, // Aprox 1/14 de botella (0.05L líquidos + merma)
  { id: 'p_gin_tanqueray', name: 'Gin Tanqueray + Refresco', category: 'Combinados', price: 9.50, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_gin_tanqueray', quantity: 0.071 }] },
  { id: 'p_ron_barcelo', name: 'Ron Barceló + Refresco', category: 'Combinados', price: 8.50, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_ron_barcelo', quantity: 0.071 }] },
  { id: 'p_whisky_jb', name: 'Whisky J&B + Refresco', category: 'Combinados', price: 8.00, imageUrl: 'https://images.unsplash.com/photo-1527281400828-ac737a999b1a?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_whisky_jb', quantity: 0.071 }] },
  { id: 'p_whisky_ballantines', name: 'Whisky Ballantine\'s + Refresco', category: 'Combinados', price: 8.50, imageUrl: 'https://images.unsplash.com/photo-1582722611229-782a04730a5c?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_whisky_ballantines', quantity: 0.071 }] },

  // --- COMIDA Y RACIONES ---
  { id: 'p_hamb_clasica', name: 'Hamburguesa Clásica', category: 'Comida', price: 9.50, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop', 
    recipe: [
      { ingredientId: 'ing_pan_hamb', quantity: 1 }, 
      { ingredientId: 'ing_carne_hamb', quantity: 1 },
      { ingredientId: 'ing_queso_cheddar', quantity: 1 },
      { ingredientId: 'ing_patatas_congeladas', quantity: 0.1 } // 250g de saco
    ] 
  },
  { id: 'p_boc_calamares', name: 'Bocadillo de Calamares', category: 'Comida', price: 6.50, imageUrl: 'https://images.unsplash.com/photo-1626078436898-9a64769f3388?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_pan_barra', quantity: 0.5 }, { ingredientId: 'ing_calamares', quantity: 0.15 }] },
  { id: 'p_racion_patatas', name: 'Ración de Patatas Bravas', category: 'Comida', price: 5.50, imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_patatas_congeladas', quantity: 0.15 }] }, // 375g de saco
  { id: 'p_racion_jamon', name: 'Ración Jamón Ibérico', category: 'Comida', price: 18.00, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop', 
    recipe: [{ ingredientId: 'ing_jamon_iberico', quantity: 0.1 }] }, // 100g de jamón
];
