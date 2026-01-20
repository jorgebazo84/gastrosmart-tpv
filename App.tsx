
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useParams, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import POS from './components/POS';
import TableManager from './components/TableManager';
import InventoryManager from './components/InventoryManager';
import AIAnalytics from './components/AIAnalytics';
import LandingPage from './components/LandingPage';
import TenantAdmin from './components/TenantAdmin';
import Dashboard from './components/Dashboard';
import UserManual from './components/UserManual';
import SalesHistory from './components/SalesHistory';
import UserManager from './components/UserManager';
import WasteManager from './components/WasteManager';
import SecurityCamera from './components/SecurityCamera';
import { supabase, db } from './services/supabaseClient';
import { AlertCircle, Terminal, CheckCircle2, ShieldAlert } from 'lucide-react';
import { 
  INITIAL_INGREDIENTS, 
  INITIAL_PRODUCTS, 
  INITIAL_TABLES,
  INITIAL_USERS 
} from './constants';
import { Sale, Ingredient, Table, User, Product, WasteEntry, Tenant, Shift, TaxEntry } from './types';

const ConfigDiagnostics: React.FC<{ missingKeys: string[] }> = ({ missingKeys }) => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
    <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-[2.5rem] p-10 shadow-2xl space-y-8 animate-in zoom-in duration-500">
      <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
        <ShieldAlert size={32} />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Configuración Incompleta</h2>
        <p className="text-gray-400 text-sm">Tu aplicación no tiene acceso a las variables de entorno.</p>
      </div>
      <div className="bg-black/50 rounded-2xl p-6 space-y-4 border border-gray-800">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Faltan las siguientes variables:</p>
        <ul className="space-y-2">
          {missingKeys.map(key => (
            <li key={key} className="flex items-center gap-2 text-red-400 text-xs font-mono">
              <AlertCircle size={14} /> {key}
            </li>
          ))}
        </ul>
      </div>
      <div className="text-gray-500 text-xs space-y-3 bg-gray-800/30 p-4 rounded-xl">
        <p className="font-bold text-gray-400 flex items-center gap-2">
          <Terminal size={14} /> Instrucciones:
        </p>
        <ol className="list-decimal list-inside space-y-1 opacity-80">
          <li>Ve al panel de Vercel</li>
          <li>Settings &gt; Environment Variables</li>
          <li>Añade las llaves faltantes</li>
          <li>Haz un nuevo "Redeploy"</li>
        </ol>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20"
      >
        Hecho, Reintentar Conexión
      </button>
    </div>
  </div>
);

const TPVMain: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>([]);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [manualEntries, setManualEntries] = useState<TaxEntry[]>([]);
  const [wasteHistory, setWasteHistory] = useState<WasteEntry[]>([]);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  
  useEffect(() => {
    const loadCloudData = async () => {
      if (!supabase) {
        setIsLoading(false);
        setDbConnected(false);
        return;
      }

      try {
        const [cloudIngs, cloudProds, cloudSales, cloudTax, cloudUsers, cloudWaste, cloudShift] = await Promise.all([
          db.getIngredients(),
          db.getProducts(),
          db.getSales(),
          db.getTaxEntries(),
          db.getUsers(),
          db.getWaste(),
          db.getActiveShift()
        ]);

        if (cloudIngs && cloudIngs.length > 0) setIngredients(cloudIngs);
        if (cloudProds && cloudProds.length > 0) setProducts(cloudProds);
        if (cloudSales) setSales(cloudSales || []);
        if (cloudTax) setManualEntries(cloudTax);
        if (cloudUsers && cloudUsers.length > 0) {
          setUsers(cloudUsers);
          setActiveUser(cloudUsers[0]);
        } else {
          setUsers(INITIAL_USERS);
          setActiveUser(INITIAL_USERS[0]);
        }
        if (cloudWaste) setWasteHistory(cloudWaste || []);
        if (cloudShift) setActiveShift(cloudShift);
        
        setDbConnected(true);
      } catch (error) {
        console.error("Supabase load error:", error);
        setDbConnected(false);
      } finally {
        setIsLoading(false);
      }
    };
    loadCloudData();
  }, []);

  const handleRegisterExpense = async (expense: TaxEntry) => {
    setManualEntries(prev => [...prev, expense]);
    if (dbConnected) await db.saveTaxEntry(expense);
    
    if (activeShift && expense.isCashOut) {
      const newTotalExpenses = (activeShift.totalExpenses || 0) + expense.total;
      const updatedShift = { ...activeShift, totalExpenses: newTotalExpenses };
      setActiveShift(updatedShift);
      if (dbConnected) await db.saveShift(updatedShift);
    }
  };

  const handleSaleComplete = async (newSale: Sale) => {
    if (!activeUser) return;

    // 1. Preparar venta con ID de turno actual
    const saleWithContext = { 
      ...newSale, 
      tenantId: tenantId || 'demo', 
      timestamp: new Date().toISOString(),
      shiftId: activeShift?.id,
      sellerId: activeUser.id
    };
    
    // 2. Actualizar estado local
    setSales(prev => [...prev, saleWithContext]);
    
    // 3. Actualizar turno ANTES de guardar la venta para evitar error de FK y actualizar totales
    if (activeShift) {
      const isCash = newSale.paymentMethod === 'Efectivo';
      const isCard = newSale.paymentMethod === 'Tarjeta' || newSale.paymentMethod === 'Datáfono';
      
      const updatedShift: Shift = {
        ...activeShift,
        totalSales: (activeShift.totalSales || 0) + newSale.total,
        totalCashSales: isCash ? (activeShift.totalCashSales || 0) + newSale.total : (activeShift.totalCashSales || 0),
        totalCard: isCard ? (activeShift.totalCard || 0) + newSale.total : (activeShift.totalCard || 0)
      };
      
      setActiveShift(updatedShift);
      if (dbConnected) {
        try {
          // Guardamos el turno primero (upsert) para que el "esperado en caja" se actualice en la DB
          await db.saveShift(updatedShift);
          // Luego guardamos la venta
          await db.saveSale(saleWithContext);
        } catch (e) {
          console.error("Error sincronizando venta con nube:", e);
        }
      }
    } else if (dbConnected) {
      await db.saveSale(saleWithContext);
    }

    // 4. Lógica de descuento de stock
    const updatedIngredients = [...ingredients];
    for (const saleItem of newSale.items) {
      const product = products.find(p => p.id === saleItem.productId);
      if (product) {
        for (const recipeItem of product.recipe) {
          const ingIndex = updatedIngredients.findIndex(i => i.id === recipeItem.ingredientId);
          if (ingIndex !== -1) {
            const ing = updatedIngredients[ingIndex];
            const newStock = ing.stock - (recipeItem.quantity * saleItem.quantity);
            updatedIngredients[ingIndex] = { ...ing, stock: newStock };
            if (dbConnected) await db.updateIngredient({ ...ing, stock: newStock });
          }
        }
      }
    }
    setIngredients(updatedIngredients);

    if (newSale.tableId) {
      setTables(prev => prev.map(t => t.id === newSale.tableId ? { ...t, status: 'libre', currentOrder: [], tempName: undefined } : t));
    }
    
    setSelectedTable(null);
    setActiveTab('tables');
  };

  const handleRegisterWaste = async (waste: WasteEntry) => {
    setWasteHistory(prev => [...prev, waste]);
    if (dbConnected) await db.saveWaste(waste);
    
    const product = products.find(p => p.id === waste.productId);
    if (product) {
      const updatedIngredients = [...ingredients];
      for (const recipeItem of product.recipe) {
        const ingIndex = updatedIngredients.findIndex(i => i.id === recipeItem.ingredientId);
        if (ingIndex !== -1) {
          const ing = updatedIngredients[ingIndex];
          const newStock = ing.stock - (recipeItem.quantity * waste.quantity);
          updatedIngredients[ingIndex] = { ...ing, stock: newStock };
          if (dbConnected) await db.updateIngredient({ ...ing, stock: newStock });
        }
      }
      setIngredients(updatedIngredients);
    }
  };

  const missingKeys = [];
  if (!process.env.API_KEY || process.env.API_KEY === '') missingKeys.push('API_KEY');
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL === '') missingKeys.push('SUPABASE_URL');
  if (!process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY === '') missingKeys.push('SUPABASE_ANON_KEY');

  if (missingKeys.length > 0 && !isLoading) {
    return <ConfigDiagnostics missingKeys={missingKeys} />;
  }

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-950 text-white gap-6">
        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black uppercase tracking-widest text-sm animate-pulse">Sincronizando con la nube...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col">
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              sales={sales} 
              ingredients={ingredients} 
              tables={tables} 
              users={users}
              products={products}
              activeShift={activeShift}
              securityEvents={[]}
              onStartShift={async (base) => {
                const newShift: Shift = { 
                  id: 's-'+Date.now(), 
                  startTime: new Date().toISOString(), 
                  initialBase: base, 
                  totalSales: 0, 
                  totalCard: 0, 
                  totalCashSales: 0, 
                  totalExpenses: 0, 
                  status: 'abierto', 
                  userId: activeUser?.id || 'u1' 
                };
                setActiveShift(newShift);
                if (dbConnected) await db.saveShift(newShift);
              }}
              onEndShift={async (finalCash) => {
                if (activeShift) {
                  const closedShift: Shift = { ...activeShift, status: 'cerrado', endTime: new Date().toISOString(), finalCash: finalCash };
                  setActiveShift(null);
                  if (dbConnected) await db.saveShift(closedShift);
                }
              }}
              onNavigateToSecurity={() => setActiveTab('security')}
              onQuickExpense={handleRegisterExpense}
            />
          )}
          {activeTab === 'tables' && (
            <TableManager 
              tables={tables} logs={[]}
              onSelectTable={(t) => { setSelectedTable(t); setActiveTab('pos'); }} 
              onMoveTable={(f, t) => setTables(prev => prev.map(m => m.id === f ? { ...m, status: 'libre', currentOrder: [] } : m.id === t ? { ...m, status: 'ocupada' } : m))}
              onOpenTable={(id, name) => setTables(prev => prev.map(t => t.id === id ? { ...t, status: 'ocupada', tempName: name, currentOrder: [] } : t))} 
              onQuickSale={() => { setSelectedTable(null); setActiveTab('pos'); }}
              isShiftOpen={!!activeShift}
            />
          )}
          {activeTab === 'pos' && activeUser && (
            <POS 
              selectedTable={selectedTable} activeUser={activeUser} users={users} onUserChange={setActiveUser}
              onSaleComplete={handleSaleComplete} onSaveOrder={(id, c) => setTables(prev => prev.map(t => t.id === id ? { ...t, currentOrder: c } : t))}
              onRenameTable={(id, n) => setTables(prev => prev.map(t => t.id === n ? { ...t, tempName: n } : t))}
              onCloseTable={() => { setSelectedTable(null); setActiveTab('tables'); }}
              isShiftOpen={!!activeShift}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
              onQuickExpense={handleRegisterExpense}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryManager 
              ingredients={ingredients} 
              products={products} 
              onUpdateRecipe={async (id, r) => {
                const prod = products.find(p => p.id === id);
                if (prod) {
                  const updated = { ...prod, recipe: r };
                  setProducts(p => p.map(pr => pr.id === id ? updated : pr));
                  if (dbConnected) await db.updateProduct(updated);
                }
              }} 
              onUpdateIngredient={async i => { 
                setIngredients(inG => inG.map(ig => ig.id === i.id ? i : ig));
                if (dbConnected) await db.updateIngredient(i);
              }} 
              onAddIngredient={async i => {
                setIngredients(prev => [...prev, i]);
                if (dbConnected) await db.updateIngredient(i);
              }} 
              onAddProduct={async p => {
                setProducts(prev => [...prev, p]);
                if (dbConnected) await db.updateProduct(p);
              }} 
            />
          )}
          {activeTab === 'sales_history' && (
            <SalesHistory 
              sales={sales} 
              manualEntries={manualEntries} 
              shiftHistory={[]} 
              users={users} 
              products={products}
              onUpdateExpenseDocument={async (id, url) => {
              }}
            />
          )}
          {activeTab === 'users' && (
            <UserManager 
              users={users} 
              onUpdateUsers={async (newUsers) => {
                setUsers(newUsers);
              }} 
            />
          )}
          {activeTab === 'waste' && activeUser && (
            <WasteManager 
              products={products} 
              activeUser={activeUser} 
              wasteHistory={wasteHistory}
              onRegisterWaste={handleRegisterWaste}
            />
          )}
          {activeTab === 'analytics' && <AIAnalytics ingredients={ingredients} sales={sales} products={products} />}
          {activeTab === 'security' && <SecurityCamera />}
          {activeTab === 'manual' && <UserManual onBack={() => setActiveTab('dashboard')} />}
        </main>
      </div>
      <footer className="bg-gray-900 text-gray-500 py-4 px-8 text-[10px] font-bold uppercase tracking-[0.2em] flex justify-between items-center border-t border-white/5 no-print">
         <div>GASTROSMART CLOUD v3.0</div>
         <div className="flex items-center gap-2">© 2025 EWOLA TECH</div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<TenantAdmin />} />
        <Route path="/tpv/:tenantId" element={<TPVMain />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
