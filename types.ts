
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  nif: string;
  address: string;
  email: string;
  phone?: string;
  taxRegime: 'Estimación Directa' | 'Módulos';
  defaultIvaRate: number;
  irpfRate: number;
  ticketHeader?: string;
  ticketFooter?: string;
  showTaxBreakdown?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  associatedIngredients: string[];
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'vendedor';
  pin: string;
}

export interface Table {
  id: string;
  number: string;
  tempName?: string;
  zone: 'interior' | 'terraza' | 'barra';
  status: 'libre' | 'ocupada' | 'cuenta';
  currentOrder: { productId: string; quantity: number; price: number; name?: string }[];
  lastActivity?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
  costPerUnit: number;
  supplierId?: string;
}

export interface ProductRecipe {
  ingredientId: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  recipe: ProductRecipe[];
  imageUrl: string;
}

export interface Sale {
  id: string;
  timestamp: string;
  items: { productId: string; quantity: number; price: number; name?: string }[];
  total: number;
  amountPaid?: number;
  change?: number;
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'CashGuard' | 'Datáfono' | 'Otro';
  paymentMethodDetail?: string;
  sellerId: string;
  tableId?: string;
  tenantId: string;
  shiftId?: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  cameraValue: number;
  appPaidValue?: number;
  type: 'mismatch' | 'detection';
  snapshotUrl?: string;
  videoRef: string;
}

export interface TableLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'move' | 'rename' | 'open' | 'save';
  details: string;
}

export interface Shift {
  id: string;
  startTime: string;
  endTime?: string;
  initialBase: number;
  finalCash?: number;
  expectedCash?: number;
  totalSales: number;
  totalCard: number;
  totalCashSales: number;
  totalExpenses: number;
  status: 'abierto' | 'cerrado';
  userId: string;
  discrepancyEvents?: SecurityEvent[];
}

export type WasteReason = 'Rotura' | 'Invitación' | 'Consumo Personal';

export interface WasteEntry {
  id: string;
  timestamp: string;
  productId: string;
  quantity: number;
  reason: WasteReason;
  userId: string;
  note?: string;
}

export interface PredictionResult {
  ingredientId: string;
  name: string;
  estimatedDepletionDate: string;
  recommendedQuantity: number;
  urgency: 'high' | 'medium' | 'low';
}

export interface TaxEntry {
  id: string;
  date: string;
  type: 'ingreso' | 'gasto';
  concept: string;
  base: number;
  taxRate: number;
  total: number;
  manual: boolean;
  isCashOut?: boolean;
  attachmentUrl?: string;
}

export interface TaxModel {
  code: string;
  name: string;
  period: string;
  totalBase: number;
  taxAmount: number;
  status: 'pendiente' | 'generado';
  details?: TaxEntry[];
}
