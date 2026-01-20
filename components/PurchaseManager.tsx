import React, { useState } from 'react';
import { Ingredient, TaxEntry } from '../types';
import { Truck, Plus, PackageCheck, Save, Search, Receipt, ArrowRight, AlertCircle } from 'lucide-react';

interface PurchaseManagerProps {
  ingredients: Ingredient[];
  onAddStock: (ingredientId: string, quantity: number, totalCost: number) => void;
  onRegisterExpense: (expense: TaxEntry) => void;
}

const PurchaseManager: React.FC<PurchaseManagerProps> = ({ ingredients, onAddStock, onRegisterExpense }) => {
  const [selectedIngId, setSelectedIngId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [concept, setConcept] = useState('');

  const handleConfirmPurchase = () => {
    if (!selectedIngId || !quantity || !totalCost) return;

    const qty = parseFloat(quantity);
    const cost = parseFloat(totalCost);
    const ing = ingredients.find(i => i.id === selectedIngId);

    if (ing) {
      // 1. Aumentar Stock
      onAddStock(selectedIngId, qty, cost);

      // 2. Registrar como gasto contable
      const expense: TaxEntry = {
        id: 'pur-' + Math.random().toString(36).substr(2, 5),
        date: new Date().toISOString().split('T')[0],
        type: 'gasto',
        concept: concept || `Compra: ${ing.name} (${qty} ${ing.unit})`,
        base: cost / 1.10, // IVA 10% hosteleria promedio
        taxRate: 0.10,
        total: cost,
        manual: true
      };
      onRegisterExpense(expense);

      // Reset
      setSelectedIngId('');
      setQuantity('');
      setTotalCost('');
      setConcept('');
      alert("Stock actualizado y gasto registrado con éxito.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Recepción de Mercancía</h2>
          <p className="text-gray-500 font-medium">Registra tus compras para actualizar stock y gastos contables.</p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
          <Truck size={18} /> Proveedores Gastrosmart
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6 h-fit">
          <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest flex items-center gap-2">
            <Plus className="text-orange-600" size={16} /> Entrada de Albarán
          </h3>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Ingrediente / Materia Prima</label>
              <select 
                className="w-full bg-gray-50 border rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-gray-100"
                value={selectedIngId}
                onChange={e => setSelectedIngId(e.target.value)}
              >
                <option value="">Selecciona qué has comprado...</option>
                {ingredients.map(i => (
                  <option key={i.id} value={i.id}>{i.name} (Stock actual: {i.stock} {i.unit})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Cantidad</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border rounded-2xl p-4 font-black outline-none focus:ring-4 focus:ring-gray-100"
                  placeholder="0.00"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Coste Total (€)</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border rounded-2xl p-4 font-black outline-none focus:ring-4 focus:ring-gray-100"
                  placeholder="0.00"
                  value={totalCost}
                  onChange={e => setTotalCost(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Nota / Proveedor (Opcional)</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-gray-100"
                placeholder="Ej. Distribuciones Pérez, Makro..."
                value={concept}
                onChange={e => setConcept(e.target.value)}
              />
            </div>

            <button 
              disabled={!selectedIngId || !quantity || !totalCost}
              onClick={handleConfirmPurchase}
              className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-gray-200 hover:bg-orange-600 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
            >
              <PackageCheck size={20} /> Registrar Entrada y Gasto
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gray-900 rounded-[3rem] p-10 text-white flex flex-col justify-center relative overflow-hidden group">
           <div className="relative z-10 max-w-lg space-y-6">
              <h3 className="text-3xl font-black uppercase tracking-tight">Consejo de Compra Inteligente</h3>
              <p className="text-gray-400 font-medium leading-relaxed italic">"Registrar el coste exacto de cada albarán permite que la IA calcule el margen bruto real de cada café o caña servida, ajustando tus precios automáticamente."</p>
              <div className="flex gap-4">
                 <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex-1">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Barriles Estimados</p>
                    <p className="text-xl font-black">2.4 Unidades</p>
                 </div>
                 <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex-1">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Gasto Semanal</p>
                    <p className="text-xl font-black">420.50€</p>
                 </div>
              </div>
           </div>
           <Truck size={200} className="absolute -bottom-10 -right-10 text-white/5 group-hover:scale-110 transition-transform duration-1000" />
        </div>
      </div>
    </div>
  );
};

export default PurchaseManager;