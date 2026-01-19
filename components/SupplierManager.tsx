
import React, { useState } from 'react';
import { Supplier, Ingredient } from '../types';
import { Truck, Phone, Mail, Plus, X, Save, Edit3, Trash2, PackageCheck } from 'lucide-react';

interface SupplierManagerProps {
  suppliers: Supplier[];
  ingredients: Ingredient[];
  onAddSupplier: (supplier: Supplier) => void;
}

const SupplierManager: React.FC<SupplierManagerProps> = ({ suppliers, ingredients, onAddSupplier }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    associatedIngredients: []
  });

  const handleSave = () => {
    if (newSupplier.name) {
      onAddSupplier({
        ...newSupplier as Supplier,
        id: Math.random().toString(36).substr(2, 9)
      });
      setIsAdding(false);
      setNewSupplier({ name: '', contactName: '', phone: '', email: '', associatedIngredients: [] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
          <Truck className="text-orange-600" size={24} /> Proveedores Habituales
        </h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Nuevo Proveedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white border-2 border-dashed rounded-[2.5rem] text-gray-400">
            Aún no has registrado proveedores. Agrégalos para que la IA asigne los pedidos automáticamente.
          </div>
        ) : (
          suppliers.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-3xl border shadow-sm space-y-4 hover:border-orange-200 transition-all group">
              <div className="flex justify-between items-start">
                 <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                    <Truck size={24} />
                 </div>
                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-orange-600"><Edit3 size={16} /></button>
                 </div>
              </div>
              <div>
                <h4 className="font-black text-gray-800 text-lg uppercase tracking-tight">{s.name}</h4>
                <p className="text-sm text-gray-400 font-bold">{s.contactName}</p>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-gray-600 text-xs font-bold">
                  <Phone size={14} className="text-gray-300" /> {s.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-xs font-bold">
                  <Mail size={14} className="text-gray-300" /> {s.email}
                </div>
              </div>
              <div className="pt-2 flex flex-wrap gap-1">
                {s.associatedIngredients.map(ingId => (
                  <span key={ingId} className="bg-gray-100 text-[9px] font-black uppercase text-gray-500 px-2 py-1 rounded">
                    {ingredients.find(i => i.id === ingId)?.name}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Ficha de Proveedor</h3>
              <button onClick={() => setIsAdding(false)}><X className="text-gray-400" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Nombre de la Empresa</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-orange-100"
                    placeholder="Ej. Distribuciones del Sur SL"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Contacto Principal</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border rounded-2xl p-4 font-bold outline-none"
                    value={newSupplier.contactName}
                    onChange={(e) => setNewSupplier({...newSupplier, contactName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Teléfono</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border rounded-2xl p-4 font-bold outline-none"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Asociar Materias Primas</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-2 bg-gray-50 rounded-2xl border">
                  {ingredients.map(ing => (
                    <label key={ing.id} className="flex items-center gap-2 p-2 bg-white rounded-xl border text-xs font-bold cursor-pointer hover:border-orange-200">
                      <input 
                        type="checkbox" 
                        checked={newSupplier.associatedIngredients?.includes(ing.id)}
                        onChange={(e) => {
                          const current = newSupplier.associatedIngredients || [];
                          if (e.target.checked) {
                            setNewSupplier({...newSupplier, associatedIngredients: [...current, ing.id]});
                          } else {
                            setNewSupplier({...newSupplier, associatedIngredients: current.filter(id => id !== ing.id)});
                          }
                        }}
                      />
                      {ing.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-8 border-t bg-gray-50">
              <button 
                onClick={handleSave}
                disabled={!newSupplier.name}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={20} /> Registrar Proveedor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManager;
