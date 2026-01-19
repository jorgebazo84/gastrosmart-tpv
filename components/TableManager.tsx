
import React, { useState } from 'react';
import { Table, TableLog } from '../types';
import { Coffee, MapPin, ArrowRightLeft, FileText, UserPlus, X, Check, Beer, Zap, ClipboardList, Clock, Info, Lock } from 'lucide-react';

interface TableManagerProps {
  tables: Table[];
  logs: TableLog[];
  onSelectTable: (table: Table) => void;
  onMoveTable: (fromId: string, toId: string) => void;
  onOpenTable: (tableId: string, tempName?: string) => void;
  onQuickSale: () => void;
  isShiftOpen: boolean;
}

const TableManager: React.FC<TableManagerProps> = ({ tables, logs, onSelectTable, onMoveTable, onOpenTable, onQuickSale, isShiftOpen }) => {
  const [activeZone, setActiveZone] = useState<'interior' | 'terraza' | 'barra'>('interior');
  const [movingFrom, setMovingFrom] = useState<string | null>(null);
  const [namingTable, setNamingTable] = useState<Table | null>(null);
  const [tempNameInput, setTempNameInput] = useState('');
  const [showLogs, setShowLogs] = useState(false);

  const filteredTables = tables.filter(t => t.zone === activeZone);

  const handleTableClick = (table: Table) => {
    if (!isShiftOpen && table.status === 'libre') {
        alert("Debes abrir la caja desde el Dashboard antes de abrir nuevas mesas.");
        return;
    }

    if (movingFrom) {
      if (table.id === movingFrom) {
          setMovingFrom(null);
          return;
      }
      if (table.status === 'libre') {
        onMoveTable(movingFrom, table.id);
        setMovingFrom(null);
      } else {
        alert("La mesa de destino debe estar libre para mover la comanda.");
      }
      return;
    }

    if (table.status === 'libre') {
      setNamingTable(table);
      setTempNameInput('');
    } else {
      onSelectTable(table);
    }
  };

  const confirmOpenTable = () => {
    if (namingTable && isShiftOpen) {
      onOpenTable(namingTable.id, tempNameInput.trim() || undefined);
      setNamingTable(null);
      setTempNameInput('');
    }
  };

  return (
    <div className="relative space-y-6 animate-in fade-in duration-500">
      
      {!isShiftOpen && (
        <div className="absolute top-0 right-0 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-red-100 animate-pulse z-10">
            <Lock size={14} /> Caja Cerrada: Apertura Deshabilitada
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl w-fit">
            {['interior', 'terraza', 'barra'].map(zone => (
            <button
                key={zone}
                onClick={() => setActiveZone(zone as any)}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${
                activeZone === zone 
                ? 'bg-white text-orange-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                {zone.toUpperCase()}
            </button>
            ))}
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <button 
                onClick={() => setShowLogs(!showLogs)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${showLogs ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-gray-500 border'}`}
            >
                <ClipboardList size={18} /> Historial Mesas
            </button>
            <button 
                onClick={() => isShiftOpen ? onQuickSale() : alert("Caja cerrada")}
                className={`flex-[2] md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl ${isShiftOpen ? 'bg-gray-900 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
                <Zap size={18} fill="currentColor" /> Venta Rápida / Barra
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTables.map(table => (
            <div 
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`relative p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group hover:scale-[1.02] active:scale-[0.98] ${
                table.status === 'ocupada' ? 'bg-orange-50 border-orange-200 shadow-orange-50' : 
                table.status === 'cuenta' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-orange-100 shadow-sm'
                } ${movingFrom === table.id ? 'ring-4 ring-blue-400 animate-pulse border-blue-400' : ''} ${!isShiftOpen && table.status === 'libre' ? 'opacity-50 grayscale-[0.5]' : ''}`}
            >
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-1 transition-transform group-hover:rotate-12 ${
                table.status === 'libre' ? 'bg-gray-50 text-gray-300' : 'bg-white text-orange-600 shadow-md border border-orange-100'
                }`}>
                {table.zone === 'barra' ? <Beer size={32} /> : <Coffee size={32} />}
                </div>
                
                <div className="text-center px-2 w-full">
                <span className="font-black text-xl text-gray-800 block leading-tight truncate">
                    {table.tempName || (table.zone === 'barra' ? `Puesto ${table.number}` : `Mesa ${table.number}`)}
                </span>
                {(table.tempName || table.zone === 'barra') && (
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mt-0.5">
                    {table.zone === 'barra' ? `Barra ${table.number}` : `Mesa ${table.number}`}
                    </span>
                )}
                </div>

                {table.currentOrder.length > 0 && (
                <span className="text-sm font-black text-white bg-orange-600 px-4 py-1.5 rounded-full shadow-lg mt-2 animate-in zoom-in">
                    {table.currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}€
                </span>
                )}
                
                {table.status === 'ocupada' && (
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                    onClick={(e) => { e.stopPropagation(); setMovingFrom(table.id); }}
                    className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors"
                    title="Mover comanda"
                    >
                    <ArrowRightLeft size={16} />
                    </button>
                </div>
                )}

                {table.status === 'libre' && isShiftOpen && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <UserPlus size={18} className="text-gray-300" />
                </div>
                )}
                
                {movingFrom && table.status === 'libre' && (
                  <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-400 rounded-[2.5rem] flex items-center justify-center z-10 pointer-events-none">
                     <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">Soltar Aquí</span>
                  </div>
                )}
            </div>
            ))}
        </div>

        {/* Sidebar de Historial / Logs */}
        <div className={`bg-white rounded-[2.5rem] border shadow-sm flex flex-col transition-all duration-300 ${showLogs ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none lg:pointer-events-auto lg:opacity-100 lg:scale-100'}`}>
            <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
                <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest flex items-center gap-2">
                    <ClipboardList size={14} className="text-orange-600" /> Historial de Operaciones
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[60vh] lg:max-h-none">
                {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-300 gap-2">
                        <Info size={32} className="opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-tight">Sin actividad reciente</p>
                    </div>
                ) : (
                    [...logs].reverse().map(log => (
                        <div key={log.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 group hover:border-orange-200 transition-all animate-in slide-in-from-right-4">
                            <div className="flex justify-between items-start">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    log.action === 'move' ? 'bg-blue-100 text-blue-600' :
                                    log.action === 'rename' ? 'bg-purple-100 text-purple-600' :
                                    log.action === 'open' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                }`}>
                                    {log.action}
                                </span>
                                <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold">
                                    <Clock size={10} /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <p className="text-xs font-medium text-gray-700 leading-tight">{log.details}</p>
                            <div className="flex items-center gap-1.5 pt-1">
                                <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-[8px] font-black text-gray-500">
                                    {log.userName.charAt(0)}
                                </div>
                                <span className="text-[9px] text-gray-400 font-bold">{log.userName}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

      {/* Modal para Personalizar Nombre al Abrir */}
      {namingTable && isShiftOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                    Abrir {namingTable.zone === 'barra' ? 'Barra' : 'Mesa'} {namingTable.number}
                </h3>
                <p className="text-xs text-gray-400 font-bold uppercase">Zona {namingTable.zone}</p>
              </div>
              <button onClick={() => setNamingTable(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Nombre Personalizado (Opcional)</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder={namingTable.zone === 'barra' ? "Ej. Juan Barra, Cliente Cerveza..." : "Ej. Familia Garcia, Juan Cañas..."}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-200 font-bold text-lg transition-all"
                  value={tempNameInput}
                  onChange={e => setTempNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && confirmOpenTable()}
                />
                <p className="text-[10px] text-gray-400 mt-3 italic font-medium">* Al cerrar la venta, el nombre volverá al estándar automáticamente.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { onOpenTable(namingTable.id); setNamingTable(null); }}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all uppercase text-xs tracking-widest"
                >
                  Omitir
                </button>
                <button 
                  onClick={confirmOpenTable}
                  className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                >
                  <Check size={18} /> Abrir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManager;
