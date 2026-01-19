
import React, { useState, useMemo } from 'react';
import { Tenant, TaxModel, Sale, Ingredient, TaxEntry } from '../types';
import { 
  ShieldCheck, Palette, FileText, Plus, Save, Download, Building2, 
  CheckCircle, Calculator, FileJson, AlertCircle, ArrowLeft, Printer, 
  Trash2, Info, Eye, Edit2, Settings2, X, Check, Receipt, Layout, 
  Cpu, Wifi, Filter, Calendar, ArrowUpRight, ArrowDownLeft, Paperclip, 
  TrendingUp, Smartphone, HardDrive, ToggleLeft as Toggle, UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TenantAdminProps {
  sales?: Sale[];
  ingredients?: Ingredient[];
  manualEntries?: TaxEntry[];
  onUpdateTenant?: (tenant: Tenant) => void;
  onAddTaxEntry?: (entry: TaxEntry) => void;
}

const TenantAdmin: React.FC<TenantAdminProps> = ({ 
  sales = [], 
  ingredients = [], 
  manualEntries = [],
  onUpdateTenant,
  onAddTaxEntry 
}) => {
  const [activeTab, setActiveTab] = useState<'taxes' | 'invoices' | 'ticket' | 'hardware' | 'config_fiscal'>('invoices');
  const navigate = useNavigate();

  // Estados para filtros
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [typeFilter, setTypeFilter] = useState<'todos' | 'ingreso' | 'gasto'>('todos');
  
  // Estado para nueva factura manual
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    concept: '',
    total: '',
    taxRate: '0.21',
    date: new Date().toISOString().split('T')[0],
    type: 'gasto' as 'ingreso' | 'gasto'
  });

  const [editingTenant, setEditingTenant] = useState<Tenant>({
    id: 'demo-1',
    name: 'GastroSmart AI by EWOLA',
    slug: 'cafe-central',
    primaryColor: '#ea580c',
    secondaryColor: '#111827',
    nif: 'B12345678',
    address: 'Plaza Mayor 1, Madrid',
    phone: '912 345 678',
    email: 'central@cafe.es',
    taxRegime: 'Estimación Directa',
    defaultIvaRate: 0.10,
    irpfRate: 0.20,
    ticketHeader: '¡Bienvenidos a nuestra cafetería!',
    ticketFooter: 'Gracias por su visita. ¡Vuelva pronto!',
    showTaxBreakdown: true,
    logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&auto=format&fit=crop'
  });

  // Configuración de Periféricos Detallada
  const [hardwareConfig, setHardwareConfig] = useState({
    itosIp: '192.168.1.50',
    itosPort: '8080',
    itosTerminalId: 'T001_MAD',
    itosDebug: true,
    cashguardIp: '192.168.1.60',
    cashguardPort: '5500',
    cashguardSecurityMode: 'Estricto',
    drawerAutoOpen: true
  });

  // Variables ficticias para modelos 111 y 115 (serían calculadas de nóminas reales)
  const [fiscalVariables, setFiscalVariables] = useState({
    totalPayrollBase: 4500, // Base sueldos empleados
    totalRentBase: 1200,    // Alquiler mensual local
  });

  // Consolidar todas las entradas
  const allEntries = useMemo(() => {
    const salesEntries: TaxEntry[] = sales.map(s => ({
      id: s.id,
      date: s.timestamp.split('T')[0],
      type: 'ingreso',
      concept: `Venta TPV #${s.id.toUpperCase()}`,
      base: s.total / 1.10,
      taxRate: 0.10,
      total: s.total,
      manual: false
    }));

    return [...salesEntries, ...manualEntries].filter(entry => {
      const matchesType = typeFilter === 'todos' || entry.type === typeFilter;
      const matchesStart = !dateFilter.start || entry.date >= dateFilter.start;
      const matchesEnd = !dateFilter.end || entry.date <= dateFilter.end;
      return matchesType && matchesStart && matchesEnd;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, manualEntries, typeFilter, dateFilter]);

  const totals = useMemo(() => {
    return allEntries.reduce((acc, curr) => {
      if (curr.type === 'ingreso') {
        acc.ingresos += curr.total;
        acc.ivaRepercutido += (curr.total - curr.base);
      } else {
        acc.gastos += curr.total;
        acc.ivaSoportado += (curr.total - curr.base);
      }
      return acc;
    }, { ingresos: 0, gastos: 0, ivaRepercutido: 0, ivaSoportado: 0 });
  }, [allEntries]);

  const handleUpdateTenant = () => {
    if (onUpdateTenant) onUpdateTenant(editingTenant);
    alert("Configuración de ticket guardada.");
  };

  const handleAddInvoice = () => {
    if (onAddTaxEntry && newInvoice.concept && newInvoice.total) {
      const totalNum = parseFloat(newInvoice.total);
      const rate = parseFloat(newInvoice.taxRate);
      onAddTaxEntry({
        id: Math.random().toString(36).substr(2, 9),
        date: newInvoice.date,
        type: newInvoice.type,
        concept: newInvoice.concept,
        base: totalNum / (1 + rate),
        taxRate: rate,
        total: totalNum,
        manual: true
      });
      setShowAddModal(false);
      setNewInvoice({ concept: '', total: '', taxRate: '0.21', date: new Date().toISOString().split('T')[0], type: 'gasto' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-gray-900 text-white p-8 flex flex-col gap-8 no-print">
        <div className="flex items-center gap-2">
            <Building2 className="text-orange-500" size={24} />
            <h1 className="text-xl font-black italic">TPV <span className="text-orange-500">EWOLA</span></h1>
        </div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveTab('invoices')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTab === 'invoices' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}><Receipt size={20} /> Gestión Facturas</button>
          <button onClick={() => setActiveTab('taxes')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTab === 'taxes' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}><Calculator size={20} /> Libros e Impuestos</button>
          <button onClick={() => setActiveTab('ticket')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTab === 'ticket' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}><FileText size={20} /> Personalizar Ticket</button>
          <button onClick={() => setActiveTab('hardware')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTab === 'hardware' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}><Cpu size={20} /> Periféricos</button>
        </nav>
        <button onClick={() => navigate(-1)} className="w-full flex items-center gap-3 p-4 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg"><ArrowLeft size={18} /> Volver</button>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto relative">
        <div className="hidden print:block font-serif text-sm">
           <div className="flex justify-between items-start border-b-2 pb-8 mb-8">
              <div>
                 <h1 className="text-2xl font-black">{editingTenant.name}</h1>
                 <p>NIF: {editingTenant.nif}</p>
                 <p>{editingTenant.address}</p>
              </div>
              <div className="text-right">
                 <h2 className="text-xl font-bold uppercase">Resumen de Operaciones</h2>
                 <p>Periodo: {dateFilter.start || 'Inicio'} - {dateFilter.end || 'Hoy'}</p>
              </div>
           </div>
           
           <table className="w-full text-left mb-8">
              <thead className="border-b">
                 <tr>
                    <th className="py-2">Fecha</th>
                    <th className="py-2">Concepto</th>
                    <th className="py-2 text-right">Base</th>
                    <th className="py-2 text-right">IVA</th>
                    <th className="py-2 text-right">Total</th>
                 </tr>
              </thead>
              <tbody className="divide-y">
                 {allEntries.map(e => (
                    <tr key={e.id}>
                       <td className="py-2">{e.date}</td>
                       <td className="py-2">{e.concept}</td>
                       <td className="py-2 text-right">{e.base.toFixed(2)}€</td>
                       <td className="py-2 text-right">{(e.total - e.base).toFixed(2)}€</td>
                       <td className={`py-2 text-right font-bold ${e.type === 'gasto' ? 'text-red-600' : ''}`}>
                          {e.type === 'gasto' ? '-' : ''}{e.total.toFixed(2)}€
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>

           <div className="grid grid-cols-2 gap-8 border-t-2 pt-8">
              <div className="space-y-2">
                 <p className="flex justify-between"><span>Total Ingresos:</span> <strong>{totals.ingresos.toFixed(2)}€</strong></p>
                 <p className="flex justify-between"><span>IVA Repercutido:</span> <strong>{totals.ivaRepercutido.toFixed(2)}€</strong></p>
              </div>
              <div className="space-y-2">
                 <p className="flex justify-between"><span>Total Gastos:</span> <strong>{totals.gastos.toFixed(2)}€</strong></p>
                 <p className="flex justify-between"><span>IVA Soportado:</span> <strong>{totals.ivaSoportado.toFixed(2)}€</strong></p>
              </div>
           </div>
        </div>

        <div className="print:hidden space-y-8 animate-in fade-in duration-500">
          
          {/* TAB: INVOICES (HISTORICO) */}
          {activeTab === 'invoices' && (
            <div className="space-y-8">
               <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-1">Módulo Administrativo</h2>
                    <h1 className="text-3xl font-black text-gray-800">Gestión de Facturas y Gastos</h1>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"><Printer size={18} /> Imprimir Resumen</button>
                     <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl"><Plus size={18} /> Añadir Factura</button>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Desde</label>
                     <input type="date" className="w-full bg-gray-50 border rounded-xl p-3 font-bold" value={dateFilter.start} onChange={e => setDateFilter({...dateFilter, start: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Hasta</label>
                     <input type="date" className="w-full bg-gray-50 border rounded-xl p-3 font-bold" value={dateFilter.end} onChange={e => setDateFilter({...dateFilter, end: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Operación</label>
                     <select className="w-full bg-gray-50 border rounded-xl p-3 font-bold outline-none" value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}>
                        <option value="todos">Todos los documentos</option>
                        <option value="ingreso">Ingresos (Ventas)</option>
                        <option value="gasto">Gastos (Facturas)</option>
                     </select>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-2xl flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black text-orange-400 uppercase">Balance Periodo</p>
                        <p className={`text-xl font-black ${totals.ingresos - totals.gastos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {(totals.ingresos - totals.gastos).toFixed(2)}€
                        </p>
                     </div>
                     <TrendingUp size={24} className="text-orange-200" />
                  </div>
               </div>

               <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
                        <tr>
                           <th className="px-8 py-5">Documento / Fecha</th>
                           <th className="px-8 py-5">Detalle</th>
                           <th className="px-8 py-5">Impuestos (IVA)</th>
                           <th className="px-8 py-5 text-right">Importe Total</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y">
                        {allEntries.map(entry => (
                           <tr key={entry.id} className="hover:bg-gray-50 transition-colors group">
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${entry.type === 'gasto' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                       {entry.type === 'gasto' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div>
                                       <p className="font-black text-gray-800 text-sm">{entry.concept}</p>
                                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{entry.date}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${entry.manual ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {entry.manual ? 'Manual / Escaneada' : 'Automático TPV'}
                                 </span>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="text-xs font-bold text-gray-500">
                                    <p>Base: {entry.base.toFixed(2)}€</p>
                                    <p>IVA ({(entry.taxRate * 100).toFixed(0)}%): {(entry.total - entry.base).toFixed(2)}€</p>
                                 </div>
                              </td>
                              <td className={`px-8 py-5 text-right font-black text-lg ${entry.type === 'gasto' ? 'text-red-600' : 'text-green-600'}`}>
                                 {entry.type === 'gasto' ? '-' : ''}{entry.total.toFixed(2)}€
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {/* TAB: TAXES (MODELOS 303, 111, 115, 130) */}
          {activeTab === 'taxes' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <h2 className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-1">Fiscalidad Española</h2>
                  <h1 className="text-3xl font-black text-gray-800 uppercase">Modelos de Autoliquidación</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {/* MODELO 303 (IVA) */}
                   <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner"><Calculator size={24} /></div>
                      <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Modelo 303</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">IVA Trimestral</p>
                      <div className="pt-4 border-t border-dashed">
                         <p className="text-2xl font-black text-blue-600">{(totals.ivaRepercutido - totals.ivaSoportado).toFixed(2)}€</p>
                         <p className="text-[9px] font-bold text-gray-400 mt-1">IVA Neto a ingresar</p>
                      </div>
                   </div>

                   {/* MODELO 130 (IRPF) */}
                   <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-inner"><TrendingUp size={24} /></div>
                      <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Modelo 130</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">IRPF Fraccionado</p>
                      <div className="pt-4 border-t border-dashed">
                         <p className="text-2xl font-black text-green-600">{Math.max(0, (totals.ingresos - totals.gastos) * 0.20).toFixed(2)}€</p>
                         <p className="text-[9px] font-bold text-gray-400 mt-1">20% del Rendimiento</p>
                      </div>
                   </div>

                   {/* MODELO 111 (RETENCIONES PERSONAL) */}
                   <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
                      <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner"><UserCheck size={24} /></div>
                      <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Modelo 111</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Retenciones Nóminas</p>
                      <div className="pt-4 border-t border-dashed">
                         <p className="text-2xl font-black text-orange-600">{(fiscalVariables.totalPayrollBase * 0.15).toFixed(2)}€</p>
                         <p className="text-[9px] font-bold text-gray-400 mt-1">Est. 15% Retención</p>
                      </div>
                   </div>

                   {/* MODELO 115 (ALQUILERES) */}
                   <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner"><Building2 size={24} /></div>
                      <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Modelo 115</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Retenciones Alquiler</p>
                      <div className="pt-4 border-t border-dashed">
                         <p className="text-2xl font-black text-purple-600">{(fiscalVariables.totalRentBase * 0.19).toFixed(2)}€</p>
                         <p className="text-[9px] font-bold text-gray-400 mt-1">19% de Retención Local</p>
                      </div>
                   </div>
                </div>

                <div className="bg-gray-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-12">
                   <div className="flex-1 space-y-6">
                      <h2 className="text-2xl font-black uppercase tracking-tight">Exportación para Gestoría Directa</h2>
                      <p className="text-gray-400 leading-relaxed">Generamos archivos ZIP con el desglose de ventas y gastos, además de las imágenes OCR de tus facturas. Compatible con A3, Contasol y Sage.</p>
                      <div className="flex gap-4">
                         <button className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-700 transition-all flex items-center gap-2"><Download size={18} /> Descargar Libro Diario</button>
                         <button className="bg-white/10 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all">Exportar Excel (SII)</button>
                      </div>
                   </div>
                   <div className="w-48 h-48 bg-orange-500/10 rounded-[3rem] flex items-center justify-center border-4 border-orange-500/20">
                      <FileJson className="text-orange-500" size={80} />
                   </div>
                </div>
             </div>
          )}

          {/* TAB: TICKET (PERSONALIZACIÓN) - RESTAURADO */}
          {activeTab === 'ticket' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-8">
                   <div>
                      <h2 className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-1">Personalización Visual</h2>
                      <h1 className="text-3xl font-black text-gray-800 uppercase">Configuración de Ticket</h1>
                   </div>

                   <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                      <div>
                         <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Logo del Establecimiento (URL)</label>
                         <input type="text" className="w-full bg-gray-50 border rounded-2xl p-4 font-bold outline-none" value={editingTenant.logo} onChange={e => setEditingTenant({...editingTenant, logo: e.target.value})} />
                      </div>
                      <div>
                         <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Encabezado del Ticket</label>
                         <textarea rows={3} className="w-full bg-gray-50 border rounded-2xl p-4 font-bold outline-none" value={editingTenant.ticketHeader} onChange={e => setEditingTenant({...editingTenant, ticketHeader: e.target.value})} />
                      </div>
                      <div>
                         <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Pie del Ticket</label>
                         <input type="text" className="w-full bg-gray-50 border rounded-2xl p-4 font-bold outline-none" value={editingTenant.ticketFooter} onChange={e => setEditingTenant({...editingTenant, ticketFooter: e.target.value})} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border">
                         <div className="flex items-center gap-3">
                            <Info className="text-orange-600" size={20} />
                            <p className="text-xs font-bold text-gray-700">Desglosar IVA por tipo impositivo</p>
                         </div>
                         <button onClick={() => setEditingTenant({...editingTenant, showTaxBreakdown: !editingTenant.showTaxBreakdown})} className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${editingTenant.showTaxBreakdown ? 'bg-orange-600 justify-end' : 'bg-gray-300 justify-start'}`}>
                            <div className="w-6 h-6 bg-white rounded-full shadow-sm"></div>
                         </button>
                      </div>
                      <button onClick={handleUpdateTenant} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2"><Save size={18} /> Guardar Formato</button>
                   </div>
                </div>

                {/* TICKET PREVIEW */}
                <div className="flex justify-center">
                   <div className="bg-white w-72 shadow-2xl p-6 border-t-[12px] border-orange-600 font-mono text-[10px] text-gray-800 space-y-4">
                      <div className="text-center space-y-2">
                         {editingTenant.logo && <img src={editingTenant.logo} className="h-10 mx-auto opacity-80" />}
                         <h4 className="font-black text-xs uppercase">{editingTenant.name}</h4>
                         <p className="leading-tight">{editingTenant.address}<br/>NIF: {editingTenant.nif}</p>
                         <p className="border-y py-1 border-dashed font-bold">{editingTenant.ticketHeader}</p>
                      </div>
                      <div className="space-y-1">
                         <div className="flex justify-between font-bold"><span>1x Café con Leche</span><span>1.60</span></div>
                         <div className="flex justify-between font-bold"><span>1x Croissant</span><span>2.10</span></div>
                      </div>
                      <div className="border-t border-dashed pt-2 space-y-1">
                         <div className="flex justify-between font-black text-xs"><span>TOTAL</span><span>3.70€</span></div>
                         {editingTenant.showTaxBreakdown && (
                            <div className="text-[8px] text-gray-400 pt-1">
                               <div className="flex justify-between"><span>BASE 10%</span><span>3.36</span></div>
                               <div className="flex justify-between"><span>IVA 10%</span><span>0.34</span></div>
                            </div>
                         )}
                      </div>
                      <p className="text-center font-bold border-t border-dashed pt-4 opacity-50">{editingTenant.ticketFooter}</p>
                      <p className="text-center text-[8px] text-gray-400">#98234-ADF | {new Date().toLocaleString()}</p>
                   </div>
                </div>
             </div>
          )}

          {/* TAB: HARDWARE (PERIFÉRICOS) - RESTAURADO Y MEJORADO */}
          {activeTab === 'hardware' && (
            <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
               <div>
                  <h2 className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-1">Hardware e Integraciones</h2>
                  <h1 className="text-3xl font-black text-gray-800">Sistemas Externos y Periféricos</h1>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* CONFIG ITOS */}
                  <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6 flex flex-col h-full">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Smartphone size={24} /></div>
                        <div>
                           <h3 className="font-black text-gray-800 uppercase tracking-tight">Pinpad ITOS (EMV)</h3>
                           <p className="text-[10px] text-gray-400 font-bold">Pasarela Bancaria Integrada</p>
                        </div>
                     </div>
                     <div className="space-y-4 flex-1">
                        <div>
                           <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Dirección IP Terminal</label>
                           <input type="text" className="w-full bg-gray-50 border rounded-xl p-3 font-bold" value={hardwareConfig.itosIp} onChange={e => setHardwareConfig({...hardwareConfig, itosIp: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Puerto</label>
                              <input type="text" className="w-full bg-gray-50 border rounded-xl p-3 font-bold" value={hardwareConfig.itosPort} onChange={e => setHardwareConfig({...hardwareConfig, itosPort: e.target.value})} />
                           </div>
                           <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Terminal ID</label>
                              <input type="text" className="w-full bg-gray-50 border rounded-xl p-3 font-bold" value={hardwareConfig.itosTerminalId} onChange={e => setHardwareConfig({...hardwareConfig, itosTerminalId: e.target.value})} />
                           </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
                           <input type="checkbox" checked={hardwareConfig.itosDebug} onChange={e => setHardwareConfig({...hardwareConfig, itosDebug: e.target.checked})} />
                           <span>HABILITAR MODO DEBUG (LOGS TÉCNICOS)</span>
                        </div>
                     </div>
                     <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-black">
                        <Wifi size={14} /> Test Conexión Terminal
                     </button>
                  </div>

                  {/* CONFIG CASHGUARD */}
                  <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6 flex flex-col h-full">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><HardDrive size={24} /></div>
                        <div>
                           <h3 className="font-black text-gray-800 uppercase tracking-tight">Cajón CashGuard</h3>
                           <p className="text-[10px] text-gray-400 font-bold">Gestión de Efectivo</p>
                        </div>
                     </div>
                     <div className="space-y-4 flex-1">
                        <div>
                           <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Dirección IP Servidor</label>
                           <input type="text" className="w-full bg-gray-50 border rounded-xl p-3 font-bold" value={hardwareConfig.cashguardIp} onChange={e => setHardwareConfig({...hardwareConfig, cashguardIp: e.target.value})} />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Modo Seguridad</label>
                           <select className="w-full bg-gray-50 border rounded-xl p-3 font-bold outline-none" value={hardwareConfig.cashguardSecurityMode} onChange={e => setHardwareConfig({...hardwareConfig, cashguardSecurityMode: e.target.value})}>
                              <option value="Estricto">Estricto (Solo importes exactos)</option>
                              <option value="Flexible">Flexible (Permite cambio manual)</option>
                           </select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                           <span className="text-[10px] font-black text-gray-500 uppercase">Apertura Automática</span>
                           <Toggle className={`cursor-pointer ${hardwareConfig.drawerAutoOpen ? 'text-orange-600' : 'text-gray-300'}`} onClick={() => setHardwareConfig({...hardwareConfig, drawerAutoOpen: !hardwareConfig.drawerAutoOpen})} />
                        </div>
                     </div>
                     <button className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-orange-700 shadow-xl shadow-orange-100">
                        <CheckCircle size={14} /> Verificar Ciclo de Cobro
                     </button>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Modal Añadir Factura */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
                   <h3 className="text-xl font-black uppercase">Nueva Factura / Gasto</h3>
                   <button onClick={() => setShowAddModal(false)}><X size={24} /></button>
                </div>
                <div className="p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                         onClick={() => setNewInvoice({...newInvoice, type: 'gasto'})}
                         className={`py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${newInvoice.type === 'gasto' ? 'bg-red-50 border-red-500 text-red-600' : 'border-gray-100 text-gray-400'}`}
                      >
                         Gasto (Compra)
                      </button>
                      <button 
                         onClick={() => setNewInvoice({...newInvoice, type: 'ingreso'})}
                         className={`py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${newInvoice.type === 'ingreso' ? 'bg-green-50 border-green-500 text-green-600' : 'border-gray-100 text-gray-400'}`}
                      >
                         Ingreso (Extra)
                      </button>
                   </div>
                   
                   <div>
                      <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Proveedor / Concepto</label>
                      <input 
                        type="text" 
                        className="w-full bg-gray-50 border rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-gray-100"
                        placeholder="Ej. Makro, Alquiler local..."
                        value={newInvoice.concept}
                        onChange={e => setNewInvoice({...newInvoice, concept: e.target.value})}
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Fecha Documento</label>
                        <input 
                           type="date" 
                           className="w-full bg-gray-50 border rounded-2xl p-4 font-bold"
                           value={newInvoice.date}
                           onChange={e => setNewInvoice({...newInvoice, date: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Importe Total (€)</label>
                        <input 
                           type="number" 
                           className="w-full bg-gray-50 border rounded-2xl p-4 font-black text-2xl outline-none"
                           placeholder="0.00"
                           value={newInvoice.total}
                           onChange={e => setNewInvoice({...newInvoice, total: e.target.value})}
                        />
                      </div>
                   </div>

                   <div>
                      <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Tipo de IVA aplicado</label>
                      <select 
                        className="w-full bg-gray-50 border rounded-2xl p-4 font-bold"
                        value={newInvoice.taxRate}
                        onChange={e => setNewInvoice({...newInvoice, taxRate: e.target.value})}
                      >
                         <option value="0.21">General (21%)</option>
                         <option value="0.10">Reducido (10%) - Alimentación</option>
                         <option value="0.04">Superreducido (4%)</option>
                         <option value="0">Exento (0%)</option>
                      </select>
                   </div>

                   <button 
                     disabled={!newInvoice.concept || !newInvoice.total}
                     onClick={handleAddInvoice}
                     className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                     <Save size={18} /> Registrar Documento
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TenantAdmin;
