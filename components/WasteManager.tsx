
import React, { useState } from 'react';
import { Product, WasteEntry, WasteReason, User } from '../types';
import { Trash2, AlertCircle, Plus, History, Wine, Coffee, Utensils, UserCheck } from 'lucide-react';

interface WasteManagerProps {
  products: Product[];
  activeUser: User;
  onRegisterWaste: (entry: WasteEntry) => void;
  wasteHistory: WasteEntry[];
}

const WasteManager: React.FC<WasteManagerProps> = ({ products, activeUser, onRegisterWaste, wasteHistory }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState<WasteReason>('Rotura');
  const [note, setNote] = useState('');

  const handleRegister = () => {
    if (!selectedProductId) return;
    
    const newEntry: WasteEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      productId: selectedProductId,
      quantity,
      reason,
      userId: activeUser.id,
      note
    };

    onRegisterWaste(newEntry);
    setSelectedProductId('');
    setQuantity(1);
    setNote('');
  };

  const getReasonStyles = (r: WasteReason) => {
    switch (r) {
      case 'Rotura': return 'bg-red-100 text-red-600 border-red-200';
      case 'Invitación': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Consumo Personal': return 'bg-orange-100 text-orange-600 border-orange-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Control de Mermas y Consumos</h2>
          <p className="text-gray-500">Registra pérdidas, invitaciones o consumo interno para un stock real.</p>
        </div>
        <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 flex items-center gap-2 text-orange-700 font-bold">
          <AlertCircle size={18} />
          <span className="text-sm">Las mermas descuentan stock automáticamente</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Registro */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
          <h3 className="font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
            <Plus className="text-orange-600" size={20} /> Registrar Nueva Merma
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Producto</label>
              <select 
                className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-100 font-bold appearance-none"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">Seleccionar producto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Cantidad</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-100 font-bold"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Motivo</label>
                <select 
                  className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-100 font-bold appearance-none"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as WasteReason)}
                >
                  <option value="Rotura">Rotura</option>
                  <option value="Invitación">Invitación</option>
                  <option value="Consumo Personal">Consumo Personal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Nota / Observación</label>
              <textarea 
                className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-100 font-medium h-24"
                placeholder="Ej: Se cayó la bandeja al servir la mesa 4..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <button 
              onClick={handleRegister}
              disabled={!selectedProductId}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl shadow-gray-200 hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Trash2 size={20} /> Confirmar Merma
            </button>
          </div>
        </div>

        {/* Historial Reciente */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
              <History size={20} className="text-orange-600" /> Registro Histórico
            </h3>
            <span className="text-xs text-gray-400 font-bold">{wasteHistory.length} Registros totales</span>
          </div>

          <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
                <tr>
                  <th className="px-6 py-4">Fecha y Hora</th>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Cant.</th>
                  <th className="px-6 py-4">Motivo</th>
                  <th className="px-6 py-4">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {wasteHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-300 italic font-medium">
                      No hay mermas registradas en el sistema.
                    </td>
                  </tr>
                ) : (
                  [...wasteHistory].reverse().map((entry) => {
                    const product = products.find(p => p.id === entry.productId);
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-700 text-sm">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                               <img src={product?.imageUrl} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-gray-800 text-sm">{product?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-black text-gray-700">{entry.quantity}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${getReasonStyles(entry.reason)}`}>
                            {entry.reason}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-500 font-bold text-xs">
                            <UserCheck size={14} className="text-gray-300" />
                            {activeUser.name}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteManager;
