
import React, { useState, useRef, useMemo } from 'react';
import { Sale, Shift, TaxEntry, User, Product } from '../types';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  FileText, 
  Image as ImageIcon, 
  Paperclip, 
  Eye, 
  X, 
  Receipt, 
  Wallet, 
  ChevronRight, 
  Download,
  AlertCircle
} from 'lucide-react';

interface SalesHistoryProps {
  sales: Sale[];
  manualEntries: TaxEntry[];
  shiftHistory: Shift[];
  users: User[];
  products: Product[];
  onUpdateExpenseDocument: (expenseId: string, url: string) => void;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ 
  sales, 
  manualEntries, 
  shiftHistory, 
  users, 
  products,
  onUpdateExpenseDocument 
}) => {
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShiftId, setSelectedShiftId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'ventas' | 'gastos'>('ventas');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeExpenseId, setActiveExpenseId] = useState<string | null>(null);

  // Filtrar turnos del día seleccionado
  const shiftsOfDay = useMemo(() => {
    return shiftHistory.filter(s => s.startTime.startsWith(filterDate));
  }, [shiftHistory, filterDate]);

  // Filtrar ventas por fecha, turno y búsqueda
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesDate = sale.timestamp.startsWith(filterDate);
      const matchesShift = selectedShiftId === 'all' || sale.shiftId === selectedShiftId;
      const matchesSearch = sale.id.includes(searchQuery) || 
                           users.find(u => u.id === sale.sellerId)?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesShift && matchesSearch;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [sales, filterDate, selectedShiftId, searchQuery, users]);

  // Filtrar gastos por fecha y búsqueda
  const filteredExpenses = useMemo(() => {
    return manualEntries.filter(entry => {
      const matchesDate = entry.date === filterDate;
      const matchesSearch = entry.concept.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    }).sort((a, b) => b.total - a.total);
  }, [manualEntries, filterDate, searchQuery]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeExpenseId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateExpenseDocument(activeExpenseId, reader.result as string);
        setActiveExpenseId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Registro de Operaciones</h2>
          <p className="text-gray-500 text-sm font-medium">Auditoría completa de ventas y salidas de caja.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex bg-white rounded-2xl border p-1 shadow-sm">
            <button 
              onClick={() => setActiveView('ventas')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'ventas' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400'}`}
            >
              Ventas
            </button>
            <button 
              onClick={() => setActiveView('gastos')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'gastos' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400'}`}
            >
              Gastos
            </button>
          </div>
          <button className="p-3 bg-white border rounded-2xl text-gray-400 hover:text-orange-600 transition-all shadow-sm">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Fecha de Auditoría</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input 
              type="date" 
              className="w-full bg-gray-50 border rounded-xl pl-11 pr-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-100"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>
        </div>

        {activeView === 'ventas' && (
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Turno de Caja</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <select 
                className="w-full bg-gray-50 border rounded-xl pl-11 pr-4 py-3 font-bold text-gray-700 outline-none appearance-none focus:ring-2 focus:ring-orange-100"
                value={selectedShiftId}
                onChange={e => setSelectedShiftId(e.target.value)}
              >
                <option value="all">Todos los turnos</option>
                {shiftsOfDay.map(shift => (
                  <option key={shift.id} value={shift.id}>
                    Turno {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className={activeView === 'gastos' ? 'md:col-span-2' : ''}>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Búsqueda Rápida</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input 
              type="text" 
              placeholder={activeView === 'ventas' ? "Ticket ID, Vendedor..." : "Proveedor, Concepto..."}
              className="w-full bg-gray-50 border rounded-xl pl-11 pr-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-100"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden min-h-[500px]">
        {activeView === 'ventas' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
                <tr>
                  <th className="px-8 py-5">Ticket / Hora</th>
                  <th className="px-8 py-5">Vendedor</th>
                  <th className="px-8 py-5">Productos</th>
                  <th className="px-8 py-5">Método Pago</th>
                  <th className="px-8 py-5 text-right">Total Bruto</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-gray-300 font-medium italic">
                      No se han encontrado ventas para este día o turno.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map(sale => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                            <Receipt size={18} />
                          </div>
                          <div>
                            <p className="font-black text-gray-800 text-sm">#{sale.id.toUpperCase()}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-600">
                        {users.find(u => u.id === sale.sellerId)?.name || 'Desconocido'}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {sale.items.map((item, i) => (
                            <span key={i} className="bg-gray-100 text-[10px] text-gray-500 px-2 py-0.5 rounded-full font-bold">
                              {item.quantity}x {item.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          sale.paymentMethod === 'Efectivo' ? 'bg-green-100 text-green-600' :
                          sale.paymentMethod === 'Tarjeta' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-900 text-white'
                        }`}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-gray-900 text-lg">
                        {sale.total.toFixed(2)}€
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
                <tr>
                  <th className="px-8 py-5">Concepto / Fecha</th>
                  <th className="px-8 py-5">Tipo Gasto</th>
                  <th className="px-8 py-5">Documento / Factura</th>
                  <th className="px-8 py-5 text-right">Importe Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-gray-300 font-medium italic">
                      No hay gastos registrados para esta fecha.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                            <Wallet size={18} />
                          </div>
                          <div>
                            <p className="font-black text-gray-800 text-sm">{expense.concept}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{expense.date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                          {expense.isCashOut ? 'Salida de Caja' : 'Factura Proveedor'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                           {expense.attachmentUrl ? (
                             <button 
                               onClick={() => setPreviewImage(expense.attachmentUrl || null)}
                               className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase hover:bg-blue-100 transition-all"
                             >
                               <ImageIcon size={14} /> Ver Documento
                             </button>
                           ) : (
                             <div className="flex items-center gap-2">
                               <span className="text-red-400 text-[10px] font-black flex items-center gap-1">
                                 <AlertCircle size={12} /> Sin Documento
                               </span>
                               <button 
                                 onClick={() => { setActiveExpenseId(expense.id); fileInputRef.current?.click(); }}
                                 className="p-1.5 bg-gray-100 text-gray-400 rounded-lg hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                               >
                                 <Paperclip size={14} />
                               </button>
                             </div>
                           )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-red-600 text-lg">
                        -{expense.total.toFixed(2)}€
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileUpload} 
      />

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[250] flex items-center justify-center p-8">
           <div className="bg-white p-4 rounded-[3rem] shadow-2xl relative max-w-2xl w-full animate-in zoom-in duration-300">
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute -top-4 -right-4 bg-orange-600 text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform"
              >
                <X size={24} />
              </button>
              <div className="rounded-[2.5rem] overflow-hidden border">
                <img src={previewImage} className="w-full h-auto max-h-[80vh] object-contain" />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
