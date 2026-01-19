
import React, { useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_INGREDIENTS } from '../constants';
import { Product, Sale, Table, User } from '../types';
import { 
  ShoppingBag, 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  User as UserIcon, 
  X, 
  Zap, 
  CreditCard as CardIcon, 
  MoreHorizontal, 
  Search, 
  Cpu,
  ArrowRight,
  Coins,
  Lock,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Wifi,
  Wallet,
  AlertCircle,
  Save
} from 'lucide-react';

interface POSProps {
  onSaleComplete: (sale: Sale) => void;
  onSaveOrder: (tableId: string, cart: any[]) => void;
  onRenameTable: (tableId: string, newName: string) => void;
  selectedTable: Table | null;
  onCloseTable: () => void;
  activeUser: User;
  users: User[];
  onUserChange: (user: User) => void;
  isShiftOpen: boolean;
  onNavigateToDashboard: () => void;
  onQuickExpense?: (expense: any) => void;
}

const POS: React.FC<POSProps> = ({ 
    onSaleComplete, 
    onSaveOrder, 
    onRenameTable,
    selectedTable, 
    onCloseTable, 
    activeUser, 
    users, 
    onUserChange,
    isShiftOpen,
    onNavigateToDashboard,
    onQuickExpense
}) => {
  const [cart, setCart] = useState<{ productId: string; quantity: number; price: number; name: string; mixerId?: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  
  // Hardware status simulation
  const [isProcessingExternal, setIsProcessingExternal] = useState<null | 'CashGuard' | 'ITOS'>(null);
  const [externalStep, setExternalStep] = useState<string>('');

  // Expense Logic
  const [showQuickExpense, setShowQuickExpense] = useState(false);
  const [quickExpenseData, setQuickExpenseData] = useState({ concept: '', amount: '' });

  // Combinados logic
  const [showMixerModal, setShowMixerModal] = useState(false);
  const [pendingSpirit, setPendingSpirit] = useState<Product | null>(null);

  // Payment logic
  const [showCashModal, setShowCashModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState<string>('');

  const categories = ['Todos', ...Array.from(new Set(INITIAL_PRODUCTS.map(p => p.category)))];
  
  const filteredProducts = INITIAL_PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const mixers = INITIAL_INGREDIENTS.filter(i => 
    i.id.includes('refresco') || i.id.includes('tonica') || i.id.includes('agua')
  );

  useEffect(() => {
    if (selectedTable) {
      setCart(selectedTable.currentOrder.map(o => ({ 
        ...o, 
        name: INITIAL_PRODUCTS.find(p => p.id === o.productId)?.name || 'Producto' 
      })) as any);
    } else {
      setCart([]);
    }
  }, [selectedTable]);

  const addToCart = (product: Product, mixer?: { id: string, name: string }) => {
    if (!isShiftOpen) return;

    if (product.category === 'Combinados' && !mixer) {
      setPendingSpirit(product);
      setShowMixerModal(true);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => 
        mixer ? (item.productId === product.id && item.mixerId === mixer.id) : (item.productId === product.id && !item.mixerId)
      );

      if (existing) {
        return prev.map(item => 
          (mixer ? (item.productId === product.id && item.mixerId === mixer.id) : (item.productId === product.id && !item.mixerId))
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      
      return [...prev, { 
        productId: product.id, 
        quantity: 1, 
        price: product.price, 
        name: mixer ? `${product.name.split('+')[0].trim()} + ${mixer.name.split('(')[0].trim()}` : product.name,
        mixerId: mixer?.id
      }];
    });
    
    setShowMixerModal(false);
    setPendingSpirit(null);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const changeToReturn = parseFloat(amountPaid) > total ? parseFloat(amountPaid) - total : 0;

  const handleQuickCash = (value: number) => {
    setAmountPaid(value.toString());
  };

  const handleCheckout = (method: Sale['paymentMethod'], finalAmountPaid?: number) => {
    if (cart.length === 0 || !isShiftOpen) return;
    const finalPaid = finalAmountPaid || total;

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
    setShowCashModal(false);
    setAmountPaid('');
  };

  const handleExternalPayment = (type: 'CashGuard' | 'ITOS') => {
    setIsProcessingExternal(type);
    setExternalStep('Conectando con periférico...');
    
    // Simulación de los pasos de la pasarela ITOS o CashGuard
    setTimeout(() => {
        setExternalStep(type === 'ITOS' ? 'Esperando lectura de tarjeta...' : 'Esperando efectivo...');
        setTimeout(() => {
            setExternalStep(type === 'ITOS' ? 'Procesando operación bancaria...' : 'Calculando cambio...');
            setTimeout(() => {
                handleCheckout(type === 'ITOS' ? 'Datáfono' : 'CashGuard');
                setIsProcessingExternal(null);
            }, 2000);
        }, 3000);
    }, 1500);
  };

  const handleQuickExpenseSubmit = () => {
    if (onQuickExpense && quickExpenseData.concept && quickExpenseData.amount) {
      onQuickExpense({
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        type: 'gasto',
        concept: quickExpenseData.concept,
        base: parseFloat(quickExpenseData.amount) / 1.21,
        taxRate: 0.21,
        total: parseFloat(quickExpenseData.amount),
        manual: true,
        isCashOut: true
      });
      setShowQuickExpense(false);
      setQuickExpenseData({ concept: '', amount: '' });
    }
  };

  return (
    <div className="relative flex h-[calc(100vh-8rem)] gap-6 animate-in fade-in duration-500">
      
      {/* MODAL PROCESANDO EXTERNO */}
      {isProcessingExternal && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8">
           <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center space-y-8 animate-in zoom-in duration-300">
              <div className="relative w-24 h-24 mx-auto">
                 <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center text-orange-600">
                    {isProcessingExternal === 'ITOS' ? <Wifi size={32} /> : <ShieldCheck size={32} />}
                 </div>
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Cobro en {isProcessingExternal}</h3>
                 <p className="text-4xl font-black text-orange-600 tracking-tighter">{total.toFixed(2)}€</p>
                 <p className="text-gray-500 font-medium pt-4 flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> {externalStep}
                 </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 No cierres el navegador mientras se completa la operación
              </div>
              <button 
                onClick={() => setIsProcessingExternal(null)}
                className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline"
              >
                Cancelar Operación (Emergencia)
              </button>
           </div>
        </div>
      )}

      {/* OVERLAY DE CAJA CERRADA */}
      {!isShiftOpen && (
        <div className="absolute inset-0 z-[150] bg-gray-50/40 backdrop-blur-[6px] rounded-[2.5rem] flex items-center justify-center p-8">
           <div className="bg-white p-12 rounded-[3rem] shadow-2xl border-4 border-orange-500/10 text-center max-w-md space-y-6">
              <div className="w-24 h-24 bg-orange-500 text-white rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-orange-200">
                 <Lock size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Caja Cerrada</h3>
                <p className="text-gray-500 font-medium">No puedes realizar ventas ni añadir productos sin abrir un turno de caja previo.</p>
              </div>
              <button 
                onClick={onNavigateToDashboard}
                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
              >
                Ir a Dashboard y Abrir Caja <ArrowRight size={18} />
              </button>
           </div>
        </div>
      )}

      {/* Product Selection Area */}
      <div className={`flex-1 flex flex-col gap-4 ${!isShiftOpen ? 'pointer-events-none' : ''}`}>
        <div className="flex gap-4 items-center">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="¿Qué desea el cliente?..." 
                    className="w-full bg-white border rounded-2xl pl-12 pr-4 py-3 font-medium outline-none shadow-sm focus:ring-2 focus:ring-orange-100 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-gray-400 border hover:bg-gray-50'}`}
                    >
                        {cat.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-2 custom-scrollbar">
          {filteredProducts.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group flex flex-col h-fit">
              <div className="relative h-28 w-full rounded-2xl overflow-hidden mb-3">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {p.category === 'Combinados' && (
                    <div className="absolute top-2 right-2 bg-orange-600 text-white p-1 rounded-lg">
                        <Zap size={14} fill="currentColor" />
                    </div>
                  )}
              </div>
              <p className="font-bold text-gray-800 text-sm leading-tight mb-1">{p.name}</p>
              <p className="text-orange-600 font-black text-lg">{p.price.toFixed(2)}€</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Area */}
      <div className={`w-96 bg-white rounded-[2.5rem] border shadow-sm flex flex-col overflow-hidden ${!isShiftOpen ? 'pointer-events-none opacity-50' : ''}`}>
        <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
            <div className="relative">
                <h2 className="font-black text-gray-800 uppercase tracking-tight truncate max-w-[180px]">
                    {selectedTable?.tempName || (selectedTable?.zone === 'barra' ? `Barra ${selectedTable.number}` : `Mesa ${selectedTable?.number}`) || 'Venta Rápida'}
                </h2>
                <button 
                  onClick={() => setShowUserSwitcher(!showUserSwitcher)}
                  className="flex items-center gap-1 group"
                >
                  <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest group-hover:underline">{activeUser.name}</p>
                  <ChevronDown size={10} className="text-orange-600" />
                </button>

                {showUserSwitcher && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border z-[160] overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b bg-gray-50 text-[10px] font-black uppercase text-gray-400 text-center tracking-widest">Cambiar Usuario</div>
                    {users.map(u => (
                      <button 
                        key={u.id}
                        onClick={() => { onUserChange(u); setShowUserSwitcher(false); }}
                        className={`w-full p-3 text-left text-xs font-bold hover:bg-orange-50 transition-colors flex items-center justify-between ${activeUser.id === u.id ? 'text-orange-600' : 'text-gray-700'}`}
                      >
                        {u.name}
                        {activeUser.id === u.id && <ShieldCheck size={14} />}
                      </button>
                    ))}
                  </div>
                )}
            </div>
            <button onClick={() => {setCart([]); if(!selectedTable) onCloseTable();}} className="p-2 bg-white rounded-xl border text-red-500 hover:bg-red-50"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4 opacity-50">
              <ShoppingBag size={48} />
              <p className="font-bold text-xs uppercase tracking-widest">Carrito Vacío</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start animate-in slide-in-from-right-2">
                <div className="flex-1 pr-4">
                  <p className="font-bold text-gray-800 text-sm leading-tight">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <button onClick={() => {
                        setCart(prev => prev.map((it, i) => i === idx ? {...it, quantity: Math.max(0, it.quantity - 1)} : it).filter(it => it.quantity > 0));
                    }} className="w-6 h-6 bg-gray-100 rounded text-gray-400 font-black">-</button>
                    <span className="text-xs font-black">{item.quantity}</span>
                    <button onClick={() => {
                        setCart(prev => prev.map((it, i) => i === idx ? {...it, quantity: it.quantity + 1} : it));
                    }} className="w-6 h-6 bg-gray-100 rounded text-gray-400 font-black">+</button>
                  </div>
                </div>
                <span className="font-black text-gray-800">{(item.quantity * item.price).toFixed(2)}€</span>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t bg-gray-50/50 space-y-4">
          <div className="flex justify-between text-2xl font-black px-2">
            <span>Total</span>
            <span className="text-orange-600">{total.toFixed(2)}€</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setShowCashModal(true)} disabled={cart.length === 0} className="py-4 bg-white border-2 border-gray-100 rounded-2xl font-black flex flex-col items-center gap-1 hover:bg-gray-100 disabled:opacity-50 text-[10px] uppercase tracking-widest group">
              <Banknote size={20} className="text-green-500 group-hover:scale-110 transition-transform" /> Efectivo (Manual)
            </button>
            <button onClick={() => handleCheckout('Tarjeta')} disabled={cart.length === 0} className="py-4 bg-blue-600 text-white rounded-2xl font-black flex flex-col items-center gap-1 hover:bg-blue-700 shadow-lg shadow-blue-100 disabled:opacity-50 text-[10px] uppercase tracking-widest">
              <CardIcon size={20} /> Datáfono Bancario
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleExternalPayment('CashGuard')} disabled={cart.length === 0} className="py-4 bg-orange-600 text-white rounded-2xl font-black flex flex-col items-center gap-1 hover:bg-orange-700 shadow-lg shadow-orange-100 disabled:opacity-50 text-[10px] uppercase tracking-widest">
              <ShieldCheck size={20} /> CashGuard
            </button>
            <button onClick={() => handleExternalPayment('ITOS')} disabled={cart.length === 0} className="py-4 bg-gray-900 text-white rounded-2xl font-black flex flex-col items-center gap-1 hover:bg-black shadow-lg shadow-gray-200 disabled:opacity-50 text-[10px] uppercase tracking-widest">
              <Cpu size={20} className="text-blue-400" /> Sistema ITOS
            </button>
          </div>

          <button 
            onClick={() => setShowQuickExpense(true)}
            className="w-full py-3 bg-gray-50 text-gray-400 border rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2"
          >
            <Wallet size={14} /> Registrar Gasto / Retirada
          </button>
        </div>
      </div>

      {/* Quick Expense Modal */}
      {showQuickExpense && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
                 <h3 className="text-xl font-black uppercase tracking-tight">Retirada de Efectivo</h3>
                 <button onClick={() => setShowQuickExpense(false)}><X size={24} /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center gap-3 text-orange-700">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="text-xs font-bold leading-tight">Registra aquí cualquier salida de dinero de caja (pan, reparaciones, etc).</p>
                 </div>
                 <div>
                    <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Motivo / Concepto</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-50 border rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-gray-100"
                      placeholder="Ej. Pago Panadero, Fontanero..."
                      value={quickExpenseData.concept}
                      onChange={e => setQuickExpenseData({...quickExpenseData, concept: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Importe a Retirar (€)</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 border rounded-2xl p-4 font-black text-3xl outline-none focus:ring-4 focus:ring-gray-100 text-orange-600"
                      placeholder="0.00"
                      value={quickExpenseData.amount}
                      onChange={e => setQuickExpenseData({...quickExpenseData, amount: e.target.value})}
                    />
                 </div>
                 <button 
                  disabled={!quickExpenseData.concept || !quickExpenseData.amount}
                  onClick={handleQuickExpenseSubmit}
                  className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                   <Save size={18} /> Confirmar Gasto
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Mixer Modal */}
      {showMixerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Seleccionar Mixer / Refresco</h3>
                        <p className="text-xs text-orange-400 font-bold uppercase">{pendingSpirit?.name}</p>
                    </div>
                    <button onClick={() => setShowMixerModal(false)}><X size={28} /></button>
                </div>
                <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mixers.map(mixer => (
                        <button 
                            key={mixer.id}
                            onClick={() => pendingSpirit && addToCart(pendingSpirit, { id: mixer.id, name: mixer.name })}
                            className="bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 hover:border-orange-600 hover:bg-orange-50 transition-all flex flex-col items-center gap-3 text-center"
                        >
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-gray-400">
                                <MoreHorizontal size={24} />
                            </div>
                            <span className="font-black text-xs uppercase text-gray-800 leading-tight">
                                {mixer.name.split('(')[0].trim()}
                            </span>
                        </button>
                    ))}
                    <button 
                         onClick={() => pendingSpirit && addToCart(pendingSpirit, { id: 'manual', name: 'Sólo / Con Hielo' })}
                         className="bg-gray-900 text-white border-2 border-gray-900 rounded-3xl p-6 hover:bg-black transition-all flex flex-col items-center gap-3 text-center"
                    >
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                             <Zap size={24} className="text-orange-400" />
                        </div>
                        <span className="font-black text-xs uppercase leading-tight">Sin Mezcla</span>
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Cash Modal with NEON Change visor and Quick Bills */}
      {showCashModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 bg-gray-50 border-b grid grid-cols-2 gap-8 items-center">
               <div className="text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Cuenta</p>
                  <p className="text-5xl font-black text-gray-900 tracking-tighter">{total.toFixed(2)}€</p>
               </div>
               {/* VISOR NEÓN */}
               <div className="bg-gray-900 rounded-[2rem] p-6 text-center shadow-2xl border-2 border-gray-800 flex flex-col justify-center items-center min-h-[120px]">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Cambio a Devolver</p>
                  <p className={`text-4xl font-mono font-black tracking-tighter ${changeToReturn > 0 ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]' : 'text-gray-600'}`}>
                    {changeToReturn.toFixed(2)}<span className="text-2xl ml-1 italic">€</span>
                  </p>
               </div>
            </div>

            <div className="p-10 space-y-10">
               {/* Quick Buttons Grid */}
               <div className="grid grid-cols-4 gap-4">
                  {[5, 10, 20, 50].map(val => (
                    <button 
                      key={val}
                      onClick={() => handleQuickCash(val)}
                      className="bg-gray-100 hover:bg-orange-600 hover:text-white py-6 rounded-2xl font-black text-xl transition-all border-b-4 border-gray-200 active:border-0 active:translate-y-1"
                    >
                      {val}€
                    </button>
                  ))}
               </div>

               <div className="relative">
                  <label className="text-xs font-black text-gray-400 uppercase mb-3 block text-center">O introduce importe manual</label>
                  <div className="relative">
                    <input 
                        type="number" 
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-8 font-black text-5xl text-center outline-none focus:ring-4 focus:ring-orange-100 transition-all text-orange-600"
                        placeholder="0.00"
                        value={amountPaid}
                        onChange={e => setAmountPaid(e.target.value)}
                        autoFocus
                    />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300">
                      <Coins size={32} />
                    </div>
                  </div>
               </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => {setShowCashModal(false); setAmountPaid('');}} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200">Cancelar</button>
                  <button 
                    disabled={parseFloat(amountPaid) < total || !amountPaid}
                    onClick={() => handleCheckout('Efectivo', parseFloat(amountPaid))}
                    className="flex-[2] py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-orange-100 disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-orange-700"
                  >
                    Confirmar Cobro y Abrir Cajón <ArrowRight size={20} />
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
