
import React, { useState, useRef } from 'react';
import { Table, Product, Sale, User, TaxEntry } from '../types';
import { INITIAL_PRODUCTS } from '../constants';
import { analyzeReceipt } from '../services/geminiService';
import { 
  Grid3X3, 
  ShoppingCart, 
  CreditCard, 
  Banknote, 
  ChevronLeft, 
  Plus, 
  Minus, 
  X, 
  CheckCircle2, 
  Zap,
  Coffee,
  Beer,
  Utensils,
  Receipt,
  Scan,
  Loader2,
  Camera,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Coins,
  Lock,
  Wallet,
  FileText,
  Paperclip
} from 'lucide-react';

interface MobileViewProps {
  tables: Table[];
  activeUser: User;
  onSaleComplete: (sale: Sale) => void;
  onSaveOrder: (tableId: string, cart: any[]) => void;
  onOpenTable: (tableId: string, tempName?: string) => void;
  onRegisterExpense?: (expense: TaxEntry) => void;
  isShiftOpen: boolean;
  onNavigateToDashboard: () => void;
}

const MobileView: React.FC<MobileViewProps> = ({ 
  tables, 
  activeUser, 
  onSaleComplete, 
  onSaveOrder, 
  onOpenTable,
  onRegisterExpense,
  isShiftOpen,
  onNavigateToDashboard
}) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'pos' | 'pay' | 'expense' | 'checkout_detail'>('tables');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [cart, setCart] = useState<{ productId: string; quantity: number; price: number; name: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  
  // Expense States
  const [expenseMode, setExpenseMode] = useState<'scan' | 'manual'>('manual');
  const [manualExpense, setManualExpense] = useState({ concept: '', total: '' });
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<Partial<TaxEntry> | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Payment states
  const [amountPaid, setAmountPaid] = useState<string>('');
  
  const categories = ['Todos', ...Array.from(new Set(INITIAL_PRODUCTS.map(p => p.category)))];
  const filteredProducts = activeCategory === 'Todos' 
    ? INITIAL_PRODUCTS 
    : INITIAL_PRODUCTS.filter(p => p.category === activeCategory);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const changeToReturn = parseFloat(amountPaid) > total ? parseFloat(amountPaid) - total : 0;

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    if (table.status === 'ocupada') {
      setCart(table.currentOrder.map(o => ({ 
        ...o, 
        name: INITIAL_PRODUCTS.find(p => p.id === o.productId)?.name || 'Producto' 
      })));
    } else {
      setCart([]);
      onOpenTable(table.id);
    }
    setActiveTab('pos');
  };

  const addToCart = (product: Product) => {
    if (!isShiftOpen) return;
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, quantity: 1, price: product.price, name: product.name }];
    });
  };

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setAttachedImage(base64);
      if (expenseMode === 'scan') {
        const result = await analyzeReceipt(base64);
        setScannedData(result);
      }
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const confirmExpense = () => {
    if (!onRegisterExpense) return;

    let expense: TaxEntry;

    if (expenseMode === 'manual') {
      if (!manualExpense.concept || !manualExpense.total) return;
      expense = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        type: 'gasto',
        concept: manualExpense.concept,
        base: parseFloat(manualExpense.total) / 1.21,
        taxRate: 0.21,
        total: parseFloat(manualExpense.total),
        manual: true,
        isCashOut: true
      };
    } else {
      if (!scannedData) return;
      expense = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        type: 'gasto',
        concept: scannedData.concept || 'Gasto Escaneado',
        base: scannedData.base || 0,
        taxRate: scannedData.taxRate || 0.21,
        total: scannedData.total || 0,
        manual: true,
        isCashOut: true
      };
    }

    onRegisterExpense(expense);
    setScannedData(null);
    setManualExpense({ concept: '', total: '' });
    setAttachedImage(null);
    setActiveTab('tables');
  };

  const handleCheckout = (method: Sale['paymentMethod']) => {
    if (cart.length === 0 || !isShiftOpen) return;
    const finalPaid = method === 'Efectivo' ? parseFloat(amountPaid) : total;
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      items: cart,
      total,
      amountPaid: finalPaid,
      change: (finalPaid - total) > 0 ? (finalPaid - total) : 0,
      paymentMethod: method,
      sellerId: activeUser.id,
      tableId: selectedTable?.id,
      tenantId: 'default'
    };
    onSaleComplete(newSale);
    setCart([]);
    setSelectedTable(null);
    setAmountPaid('');
    setActiveTab('tables');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 safe-top">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {activeTab !== 'tables' && (
            <button onClick={() => setActiveTab(activeTab === 'checkout_detail' ? 'pay' : 'tables')} className="p-2 -ml-2 text-gray-400">
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="font-black text-lg uppercase tracking-tight">
            {activeTab === 'tables' ? 'Salón' : activeTab === 'expense' ? 'Gasto de Caja' : activeTab === 'checkout_detail' ? 'Cobro Efectivo' : selectedTable?.tempName || `Mesa ${selectedTable?.number}`}
          </h1>
        </div>
        {activeTab === 'tables' && (
          <button 
            onClick={() => setActiveTab('expense')}
            className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase"
          >
            <Wallet size={14} /> Retirada / Gasto
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* AVISO CAJA CERRADA MOBILE */}
        {!isShiftOpen && (activeTab === 'pos' || activeTab === 'pay' || activeTab === 'checkout_detail' || activeTab === 'expense') && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
             <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Lock size={40} />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 uppercase">Caja Cerrada</h3>
                <p className="text-sm text-gray-500 font-medium">Debes abrir el turno de caja para poder operar.</p>
             </div>
             <button 
                onClick={onNavigateToDashboard}
                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest"
             >
                Ir a Dashboard
             </button>
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="p-4 grid grid-cols-2 gap-3 animate-in fade-in duration-300">
            {tables.map(table => (
              <button
                key={table.id}
                onClick={() => handleTableSelect(table)}
                className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
                  table.status === 'ocupada' 
                    ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100' 
                    : 'bg-white border-gray-100 text-gray-400'
                }`}
              >
                <div className={`${table.status === 'ocupada' ? 'text-white' : 'text-gray-200'}`}>
                  {table.zone === 'barra' ? <Beer size={32} /> : <Coffee size={32} />}
                </div>
                <span className="font-black text-lg">{table.tempName || table.number}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'expense' && isShiftOpen && (
          <div className="p-6 space-y-6 animate-in slide-in-from-bottom-4">
            {/* Expense Mode Switcher */}
            <div className="flex bg-white p-1 rounded-2xl border shadow-sm">
               <button 
                onClick={() => setExpenseMode('manual')}
                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${expenseMode === 'manual' ? 'bg-gray-900 text-white' : 'text-gray-400'}`}
               >
                 <Wallet size={14} /> Manual
               </button>
               <button 
                onClick={() => setExpenseMode('scan')}
                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${expenseMode === 'scan' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400'}`}
               >
                 <Camera size={14} /> Escáner IA
               </button>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
               {expenseMode === 'manual' ? (
                 <div className="space-y-4">
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Retirada de Efectivo</h2>
                    <p className="text-xs text-gray-400 font-medium">Registra el dinero que sale de caja ahora.</p>
                    
                    <div className="space-y-4 pt-2">
                       <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Motivo / Proveedor</label>
                          <input 
                            type="text" 
                            className="w-full bg-gray-50 border rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-gray-200"
                            placeholder="Ej. Pago Panadería, Reparación..."
                            value={manualExpense.concept}
                            onChange={e => setManualExpense({...manualExpense, concept: e.target.value})}
                          />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Importe Total (€)</label>
                          <input 
                            type="number" 
                            className="w-full bg-gray-50 border rounded-2xl p-4 font-black text-2xl outline-none focus:ring-2 focus:ring-gray-200"
                            placeholder="0.00"
                            value={manualExpense.total}
                            onChange={e => setManualExpense({...manualExpense, total: e.target.value})}
                          />
                       </div>

                       {/* Optional Photo Attachment */}
                       <div className="pt-2">
                          {attachedImage ? (
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border">
                               <img src={attachedImage} className="w-full h-full object-cover" />
                               <button 
                                onClick={() => setAttachedImage(null)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg"
                               >
                                 <X size={16} />
                               </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full py-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all"
                            >
                               <Paperclip size={20} />
                               <span className="text-[10px] font-black uppercase tracking-widest">¿Tienes el ticket? Adjúntalo</span>
                            </button>
                          )}
                          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScanReceipt} />
                       </div>

                       <button 
                        disabled={!manualExpense.concept || !manualExpense.total}
                        onClick={confirmExpense}
                        className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl disabled:opacity-50"
                       >
                         Confirmar Retirada
                       </button>
                    </div>
                 </div>
               ) : (
                 <div className="text-center space-y-4">
                    {!scannedData ? (
                      <>
                        <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-3xl mx-auto flex items-center justify-center">
                          {isScanning ? <Loader2 className="animate-spin" size={32} /> : <Scan size={32} />}
                        </div>
                        <h2 className="text-xl font-black text-gray-800">Escáner IA EWOLA</h2>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">Sube una foto del ticket y la IA extraerá el importe automáticamente.</p>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isScanning}
                          className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-orange-100"
                        >
                          <Camera size={20} /> Escanear Ticket
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScanReceipt} />
                      </>
                    ) : (
                      <div className="text-left space-y-4 animate-in slide-in-from-bottom-4">
                        <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                           <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Concepto Detectado</p>
                           <h3 className="text-lg font-black text-gray-800 truncate">{scannedData.concept}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-gray-50 p-4 rounded-2xl">
                              <label className="text-[10px] font-black text-gray-400 uppercase">Base</label>
                              <p className="text-lg font-bold">{scannedData.base?.toFixed(2)}€</p>
                           </div>
                           <div className="bg-gray-50 p-4 rounded-2xl">
                              <label className="text-[10px] font-black text-gray-400 uppercase">Total</label>
                              <p className="text-xl font-black text-red-600">{scannedData.total?.toFixed(2)}€</p>
                           </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                           <button onClick={() => setScannedData(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest">Reintentar</button>
                           <button onClick={confirmExpense} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Confirmar</button>
                        </div>
                      </div>
                    )}
                 </div>
               )}
            </div>
          </div>
        )}

        {isShiftOpen && activeTab === 'pos' && (
          <div className="flex flex-col h-full">
            <div className="flex overflow-x-auto gap-2 p-4 bg-white border-b no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all uppercase ${
                    activeCategory === cat ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="p-4 grid grid-cols-2 gap-3">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 active:scale-95 transition-transform"
                >
                  <img src={product.imageUrl} className="w-full h-24 object-cover rounded-xl" />
                  <div className="text-left">
                    <p className="font-bold text-xs truncate leading-tight">{product.name}</p>
                    <p className="text-orange-600 font-black">{product.price.toFixed(2)}€</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isShiftOpen && activeTab === 'pay' && (
          <div className="p-4 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Resumen de Comanda</h3>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.productId} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-100 text-gray-800 text-[10px] font-black px-2 py-0.5 rounded">{item.quantity}x</span>
                      <span className="font-bold text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-black">{(item.quantity * item.price).toFixed(2)}€</span>
                  </div>
                ))}
                <div className="pt-6 mt-6 border-t-2 border-dashed border-gray-100 flex justify-between items-end">
                  <span className="text-xl font-black uppercase">Total a Cobrar</span>
                  <span className="text-4xl font-black text-orange-600">{total.toFixed(2)}€</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => setActiveTab('checkout_detail')} 
                className="w-full py-5 bg-white border-2 border-gray-100 rounded-[1.5rem] font-black text-gray-800 flex items-center justify-center gap-3 shadow-sm active:bg-gray-100"
              >
                <Banknote size={24} className="text-green-500" /> COBRAR EFECTIVO (MANUAL)
              </button>
              <button 
                onClick={() => handleCheckout('Tarjeta')} 
                className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 shadow-xl active:bg-blue-700"
              >
                <CreditCard size={24} /> COBRAR DATÁFONO
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleCheckout('CashGuard')} 
                  className="py-5 bg-orange-600 text-white rounded-[1.5rem] font-black flex flex-col items-center justify-center gap-1 shadow-lg active:bg-orange-700 text-[10px] uppercase"
                >
                  <ShieldCheck size={20} /> CashGuard
                </button>
                <button 
                  onClick={() => handleCheckout('Datáfono')} 
                  className="py-5 bg-gray-900 text-white rounded-[1.5rem] font-black flex flex-col items-center justify-center gap-1 shadow-lg active:bg-black text-[10px] uppercase"
                >
                  <Cpu size={20} className="text-blue-400" /> ITOS / Otros
                </button>
              </div>
            </div>
          </div>
        )}

        {isShiftOpen && activeTab === 'checkout_detail' && (
          <div className="p-6 space-y-8 animate-in slide-in-from-right-4">
             {/* VISOR NEÓN MÓVIL */}
             <div className="bg-gray-900 p-8 rounded-[2rem] text-center shadow-2xl border-2 border-gray-800">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Cambio a Devolver</p>
                <p className={`text-5xl font-mono font-black ${changeToReturn > 0 ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-gray-600'}`}>
                  {changeToReturn.toFixed(2)}€
                </p>
             </div>

             <div className="grid grid-cols-4 gap-3">
                {[5, 10, 20, 50].map(val => (
                  <button 
                    key={val} 
                    onClick={() => setAmountPaid(val.toString())}
                    className="bg-white border rounded-2xl py-4 font-black text-gray-800 shadow-sm active:bg-orange-600 active:text-white"
                  >
                    {val}€
                  </button>
                ))}
             </div>

             <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase text-center block">Importe Manual</label>
                <input 
                  type="number" 
                  className="w-full bg-white border-2 border-gray-100 rounded-[2rem] p-6 text-center text-4xl font-black outline-none focus:ring-4 focus:ring-orange-100"
                  placeholder="0.00"
                  value={amountPaid}
                  onChange={e => setAmountPaid(e.target.value)}
                  autoFocus
                />
             </div>

             <button 
                disabled={parseFloat(amountPaid) < total || !amountPaid}
                onClick={() => handleCheckout('Efectivo')}
                className="w-full py-5 bg-orange-600 text-white rounded-[2rem] font-black text-lg uppercase shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3"
             >
                Confirmar y Finalizar <ArrowRight size={20} />
             </button>
          </div>
        )}
      </main>

      <footer className="bg-white border-t px-6 py-3 flex justify-around items-center fixed bottom-0 left-0 right-0 z-50 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('tables')} className={`flex flex-col items-center gap-1 ${activeTab === 'tables' ? 'text-orange-600' : 'text-gray-300'}`}>
          <Grid3X3 size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Mesas</span>
        </button>
        <button onClick={() => setActiveTab('pos')} className={`flex flex-col items-center gap-1 ${activeTab === 'pos' ? 'text-orange-600' : 'text-gray-300'}`}>
          <ShoppingCart size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Pedido</span>
        </button>
        <button 
          onClick={() => { if(cart.length > 0) setActiveTab('pay'); }} 
          disabled={cart.length === 0} 
          className={`flex flex-col items-center gap-1 ${activeTab === 'pay' || activeTab === 'checkout_detail' ? 'text-orange-600' : cart.length === 0 ? 'text-gray-100' : 'text-gray-300'}`}
        >
          <CheckCircle2 size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Cobrar</span>
        </button>
      </footer>
    </div>
  );
};

export default MobileView;
