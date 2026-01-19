
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useParams, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import POS from './components/POS';
import TableManager from './components/TableManager';
import InventoryManager from './components/InventoryManager';
import AIAnalytics from './components/AIAnalytics';
import SecurityCamera from './components/SecurityCamera';
import Portfolio from './components/Portfolio';
import LandingPage from './components/LandingPage';
import WasteManager from './components/WasteManager';
import TenantAdmin from './components/TenantAdmin';
import Dashboard from './components/Dashboard';
import UserManual from './components/UserManual';
import MobileView from './components/MobileView';
import UserManager from './components/UserManager';
import SalesHistory from './components/SalesHistory';
import { supabase, db } from './services/supabaseClient';
import { 
  INITIAL_INGREDIENTS, 
  INITIAL_PRODUCTS, 
  INITIAL_TABLES,
  INITIAL_USERS 
} from './constants';
import { Sale, Ingredient, Table, User, Product, ProductRecipe, WasteEntry, Tenant, Supplier, Shift, SecurityEvent, TableLog, TaxEntry } from './types';

const TPVMain: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>([]);
  const [wastes, setWastes] = useState<WasteEntry[]>([]);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [activeUser, setActiveUser] = useState<User>(INITIAL_USERS[0]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [manualEntries, setManualEntries] = useState<TaxEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [shiftHistory, setShiftHistory] = useState<Shift[]>([]);

  const [currentTenant, setCurrentTenant] = useState<Tenant>({
    id: tenantId || 'demo',
    name: (tenantId || 'Demo Cafe').replace('-', ' ').toUpperCase(),
    slug: tenantId || 'demo',
    primaryColor: '#ea580c',
    secondaryColor: '#111827',
    nif: 'B12345678',
    address: 'Calle Mayor 1, Madrid',
    email: 'contacto@demo.es',
    phone: '912 345 678',
    taxRegime: 'Estimación Directa',
    defaultIvaRate: 0.10,
    irpfRate: 0.20,
    ticketHeader: '¡Bienvenidos!',
    ticketFooter: 'Gracias por su visita',
    showTaxBreakdown: true
  });

  // CARGAR DATOS DE SUPABASE AL INICIAR
  useEffect(() => {
    const loadCloudData = async () => {
      if (!supabase) {
        console.log("Database keys not found. Running in Local Mode.");
        setIsLoading(false);
        setDbConnected(false);
        return;
      }

      try {
        const [cloudIngs, cloudProds, cloudSales, cloudTax] = await Promise.all([
          db.getIngredients(),
          db.getProducts(),
          db.getSales(),
          db.getTaxEntries()
        ]);

        if (cloudIngs) setIngredients(cloudIngs);
        if (cloudProds) setProducts(cloudProds);
        if (cloudSales) setSales(cloudSales);
        if (cloudTax) setManualEntries(cloudTax);
        
        setDbConnected(true);
      } catch (error) {
        console.error("Error cargando datos de Supabase:", error);
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
      setActiveShift(prev => prev ? {
        ...prev,
        totalExpenses: (prev.totalExpenses || 0) + expense.total
      } : null);
    }
  };

  const handleSaleComplete = async (newSale: Sale) => {
    const saleWithContext = { 
      ...newSale, 
      tenantId: tenantId || 'demo', 
      timestamp: new Date().toISOString(),
      shiftId: activeShift?.id
    };
    
    setSales(prev => [...prev, saleWithContext]);
    if (dbConnected) await db.saveSale(saleWithContext);
    
    // Actualizar stock
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

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-6">
        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black uppercase tracking-widest text-sm animate-pulse">Sincronizando con la nube...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col">
      {/* Banner de aviso de modo local si no hay DB */}
      {!dbConnected && !isLoading && (
        <div className="bg-blue-600 text-white text-[10px] font-black uppercase py-2 px-4 flex justify-center gap-4 tracking-widest no-print">
          <span>⚠️ MODO DEMO LOCAL ACTIVO</span>
          <span className="opacity-60">-</span>
          <span>Configura SUPABASE_URL y SUPABASE_ANON_KEY en Vercel para persistencia real</span>
        </div>
      )}

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
              onStartShift={(base) => setActiveShift({ id: 's-'+Date.now(), startTime: new Date().toISOString(), initialBase: base, totalSales: 0, totalCard: 0, totalCashSales: 0, totalExpenses: 0, status: 'abierto', userId: activeUser.id })}
              onEndShift={(finalCash) => setActiveShift(null)}
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
          {activeTab === 'pos' && (
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
          {activeTab === 'inventory' && <InventoryManager ingredients={ingredients} products={products} onUpdateRecipe={(id, r) => setProducts(p => p.map(pr => pr.id === id ? {...pr, recipe: r} : pr))} onUpdateIngredient={async i => { 
              setIngredients(inG => inG.map(ig => ig.id === i.id ? i : ig));
              if (dbConnected) await db.updateIngredient(i);
            }} onAddIngredient={async i => {
              setIngredients(prev => [...prev, i]);
              if (dbConnected) await db.updateIngredient(i);
            }} onAddProduct={p => setProducts(prev => [...prev, p])} />}
          {activeTab === 'analytics' && <AIAnalytics ingredients={ingredients} sales={sales} products={products} />}
          {activeTab === 'manual' && <UserManual onBack={() => setActiveTab('dashboard')} />}
        </main>
      </div>
      <footer className="bg-gray-900 text-gray-500 py-4 px-8 text-[10px] font-bold uppercase tracking-[0.2em] flex justify-between items-center border-t border-white/5 no-print">
         <div>GASTROSMART {dbConnected ? 'CLOUD SYNC' : 'LOCAL MODE'} v3.0</div>
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
