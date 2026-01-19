
import React, { useState, useMemo } from 'react';
import { Sale, User, Ingredient, Table, Product, Shift, SecurityEvent } from '../types';
import { Calendar, Users, TrendingUp, Filter, Download, RefreshCcw, Banknote, Clock, Lock, CheckCircle2, AlertTriangle, AreaChart as AreaIcon, Video, Eye, ArrowRight, Camera, BarChart3, Receipt, Scan, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import AIAnalytics from './AIAnalytics';

interface DashboardProps {
  sales: Sale[];
  ingredients: Ingredient[];
  tables: Table[];
  users: User[];
  products: Product[];
  activeShift: Shift | null;
  securityEvents: SecurityEvent[];
  onStartShift: (base: number) => void;
  onEndShift: (finalCash: number, relevantEvents: SecurityEvent[]) => void;
  onNavigateToSecurity: () => void;
  onQuickExpense?: (expense: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  sales, 
  ingredients, 
  tables, 
  users, 
  products,
  activeShift,
  securityEvents,
  onStartShift,
  onEndShift,
  onNavigateToSecurity,
  onQuickExpense
}) => {
  const [filterSeller, setFilterSeller] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftInput, setShiftInput] = useState<number>(0);
  const [isClosingConfirmed, setIsClosingConfirmed] = useState(false);

  const filteredSales = sales.filter(sale => {
    const isSellerMatch = filterSeller === 'all' || sale.sellerId === filterSeller;
    const saleDate = new Date(sale.timestamp);
    const isStartMatch = !dateRange.start || saleDate >= new Date(dateRange.start);
    const isEndMatch = !dateRange.end || saleDate <= new Date(dateRange.end);
    return isSellerMatch && isStartMatch && isEndMatch;
  });

  const chartData = useMemo(() => {
    const dailyMap = new Map<string, number>();
    filteredSales.forEach(sale => {
      const date = new Date(sale.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
      dailyMap.set(date, (dailyMap.get(date) || 0) + sale.total);
    });
    return Array.from(dailyMap.entries())
      .map(([date, total]) => ({ date, total }))
      .slice(-7);
  }, [filteredSales]);

  const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
  const totalOrders = filteredSales.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const discrepancy = activeShift ? shiftInput - (activeShift.initialBase + activeShift.totalCashSales - (activeShift.totalExpenses || 0)) : 0;
  
  const relevantSecurityEvents = useMemo(() => {
    if (!activeShift || Math.abs(discrepancy) < 0.01) return [];
    return securityEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      const shiftStart = new Date(activeShift.startTime);
      return eventDate >= shiftStart && (event.type === 'mismatch' || Math.abs(event.cameraValue - Math.abs(discrepancy)) <= 5);
    });
  }, [activeShift, securityEvents, discrepancy]);

  const handleShiftAction = () => {
    if (activeShift) {
      if (!isClosingConfirmed && Math.abs(discrepancy) > 0.01) {
        setIsClosingConfirmed(true);
        return;
      }
      onEndShift(shiftInput, relevantSecurityEvents);
    } else {
      onStartShift(shiftInput);
    }
    setShowShiftModal(false);
    setShiftInput(0);
    setIsClosingConfirmed(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-gray-200 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl ${activeShift ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                {activeShift ? <Clock size={24} /> : <Lock size={24} />}
              </div>
              {activeShift && (
                <span className="text-[10px] font-black uppercase tracking-widest bg-green-500 text-white px-3 py-1 rounded-full animate-pulse">
                  Turno Activo
                </span>
              )}
            </div>
            
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">
              {activeShift ? 'Turno en Curso' : 'Caja Cerrada'}
            </h3>
            
            <div className="space-y-4 mb-8">
              {activeShift ? (
                <>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400 text-xs font-bold uppercase">Base Inicial</span>
                    <span className="font-bold">{activeShift.initialBase.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400 text-xs font-bold uppercase">Ventas Efectivo</span>
                    <span className="font-bold">{activeShift.totalCashSales.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-red-400 text-xs font-bold uppercase">Gastos Pagados</span>
                    <span className="font-bold text-red-400">-{activeShift.totalExpenses?.toFixed(2) || '0.00'}€</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-orange-400 text-sm font-black uppercase">Esperado en Caja</span>
                    <span className="text-xl font-black">{(activeShift.initialBase + activeShift.totalCashSales - (activeShift.totalExpenses || 0)).toFixed(2)}€</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-sm">Inicia un nuevo turno para registrar ventas y controlar el efectivo de caja.</p>
              )}
            </div>

            <button 
              onClick={() => {
                setShiftInput(activeShift ? (activeShift.initialBase + activeShift.totalCashSales - (activeShift.totalExpenses || 0)) : 150);
                setShowShiftModal(true);
              }}
              className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg ${
                activeShift 
                  ? 'bg-white text-gray-900 hover:bg-red-50 hover:text-red-600 shadow-white/10' 
                  : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-900/20'
              }`}
            >
              {activeShift ? 'Cerrar Caja y Turno' : 'Abrir Turno Nuevo'}
            </button>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
             <Banknote size={200} />
          </div>
        </div>

        <div className="flex-1 bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filtro de Empleado</label>
              <div className="relative">
                 <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                 <select 
                  className="w-full bg-gray-50 border rounded-2xl pl-12 pr-4 py-3 font-bold text-gray-700 outline-none appearance-none"
                  value={filterSeller}
                  onChange={(e) => setFilterSeller(e.target.value)}
                >
                  <option value="all">Todos los empleados</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rango de Tiempo</label>
               <div className="flex items-center gap-2">
                  <input type="date" className="flex-1 bg-gray-50 border rounded-2xl px-4 py-3 font-bold text-gray-700 text-sm outline-none" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
                  <span className="text-gray-300">→</span>
                  <input type="date" className="flex-1 bg-gray-50 border rounded-2xl px-4 py-3 font-bold text-gray-700 text-sm outline-none" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
               </div>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={() => { setFilterSeller('all'); setDateRange({start: '', end: ''}); }} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:text-orange-600 border transition-all"><RefreshCcw size={20} /></button>
            <button className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-gray-200">
              <Download size={18} /> Exportar Reporte
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm group">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase mb-2 tracking-widest">Facturación Total</h3>
          <p className="text-4xl font-black text-gray-800 tracking-tighter">{totalRevenue.toFixed(2)}€</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase mb-2 tracking-widest">Tickets Emitidos</h3>
          <p className="text-4xl font-black text-gray-800 tracking-tighter">{totalOrders}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase mb-2 tracking-widest">Consumo Medio</h3>
          <p className="text-4xl font-black text-gray-800 tracking-tighter">{avgTicket.toFixed(2)}€</p>
        </div>
        <div className="bg-orange-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-orange-100">
          <h3 className="text-orange-200 font-bold text-[10px] uppercase mb-2 tracking-widest">Alertas AI</h3>
          <p className="text-4xl font-black tracking-tighter">{ingredients.filter(i => i.stock < i.minStock).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                <BarChart3 className="text-orange-600" /> Recaudación Diaria
             </h3>
             <span className="text-[10px] text-gray-400 font-bold uppercase">Comparativa por fecha</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#ea580c' : '#fdba74'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <AIAnalytics ingredients={ingredients} sales={sales} products={products} />
      </div>

      {showShiftModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className={`bg-white w-full ${isClosingConfirmed ? 'max-w-3xl' : 'max-w-md'} rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]`}>
            <div className="p-10 bg-gray-50 flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center shadow-lg ${activeShift ? (isClosingConfirmed ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600') : 'bg-green-50 text-green-600'}`}>
                {activeShift ? (isClosingConfirmed ? <Video size={40} /> : <AlertTriangle size={40} />) : <CheckCircle2 size={40} />}
              </div>
              <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
                {activeShift ? (isClosingConfirmed ? 'Investigación de Descuadre' : 'Cierre de Turno') : 'Apertura de Turno'}
              </h3>
            </div>
            
            <div className="p-10 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
               {!isClosingConfirmed ? (
                 <>
                   <div>
                      <label className="text-xs font-black text-gray-400 uppercase mb-2 block">
                        {activeShift ? 'Efectivo Real en Caja (€)' : 'Base Inicial de Caja (€)'}
                      </label>
                      <input 
                        type="number" 
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 font-black text-4xl text-center outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                        value={shiftInput}
                        onChange={e => setShiftInput(parseFloat(e.target.value) || 0)}
                        autoFocus
                      />
                   </div>

                   {activeShift && (
                     <div className="bg-blue-50 p-4 rounded-2xl flex justify-between items-center text-blue-700">
                        <span className="text-xs font-bold uppercase">Debería haber:</span>
                        <span className="font-black">{(activeShift.initialBase + activeShift.totalCashSales - (activeShift.totalExpenses || 0)).toFixed(2)}€</span>
                     </div>
                   )}
                 </>
               ) : (
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Diferencia Final</p>
                            <p className="text-3xl font-black text-red-600">{discrepancy.toFixed(2)}€</p>
                        </div>
                        <div className="bg-gray-900 p-6 rounded-[2rem] text-white">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pruebas Encontradas</p>
                            <p className="text-3xl font-black">{relevantSecurityEvents.length} clips</p>
                        </div>
                    </div>
                 </div>
               )}

               <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => {
                        setShowShiftModal(false);
                        setIsClosingConfirmed(false);
                    }} 
                    className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleShiftAction} 
                    className={`flex-1 py-4 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all ${activeShift ? (isClosingConfirmed ? 'bg-orange-600 shadow-orange-100' : 'bg-red-600 shadow-red-100') : 'bg-green-600 shadow-green-100'}`}
                  >
                    {activeShift ? (isClosingConfirmed ? 'Confirmar Cierre' : 'Cerrar Caja') : 'Abrir Caja'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
