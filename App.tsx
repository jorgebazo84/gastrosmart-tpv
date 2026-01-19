
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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [tableLogs, setTableLogs] = useState<TableLog[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [manualEntries, setManualEntries] = useState<TaxEntry[]>([]);
  
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-brand', currentTenant.primaryColor);
    document.documentElement.style.setProperty('--secondary-brand', currentTenant.secondaryColor);
  }, [currentTenant]);

  const handleRegisterExpense = (expense: TaxEntry) => {
    setManualEntries(prev => [...prev, expense]);
    if (activeShift && expense.isCashOut) {
      setActiveShift(prev => prev ? {
        ...prev,
        totalExpenses: (prev.totalExpenses || 0) + expense.total
      } : null);
    }
  };

  const handleUpdateExpenseDocument = (expenseId: string, url: string) => {
    setManualEntries(prev => prev.map(e => e.id === expenseId ? { ...e, attachmentUrl: url } : e));
  };

  const handleRegisterWaste = (entry: WasteEntry) => {
    setWastes(prev => [...prev, entry]);
    
    // Descontar del stock de ingredientes
    const product = products.find(p => p.id === entry.productId);
    if (product) {
      setIngredients(prevIngs => {
        const updatedIngs = [...prevIngs];
        product.recipe.forEach(recipeItem => {
          const ingIndex = updatedIngs.findIndex(i => i.id === recipeItem.ingredientId);
          if (ingIndex > -1) {
            updatedIngs[ingIndex].stock -= (recipeItem.quantity * entry.quantity);
          }
        });
        return updatedIngs;
      });
    }
  };

  const handleSaleComplete = (newSale: Sale) => {
    const saleWithContext = { 
      ...newSale, 
      tenantId: tenantId || 'demo', 
      timestamp: new Date().toISOString(),
      shiftId: activeShift?.id // Vinculamos la venta al turno activo
    };
    setSales(prev => [...prev, saleWithContext]);
    
    if (activeShift) {
      setActiveShift(prev => {
        if (!prev) return null;
        return {
          ...prev,
          totalSales: prev.totalSales + saleWithContext.total,
          totalCard: (saleWithContext.paymentMethod === 'Tarjeta' || saleWithContext.paymentMethod === 'Datáfono') ? prev.totalCard + saleWithContext.total : prev.totalCard,
          totalCashSales: (saleWithContext.paymentMethod === 'Efectivo' || saleWithContext.paymentMethod === 'CashGuard') ? prev.totalCashSales + saleWithContext.total : prev.totalCashSales,
        };
      });
    }

    if (newSale.tableId) {
      setTables(prev => prev.map(t => t.id === newSale.tableId ? { ...t, status: 'libre', currentOrder: [], tempName: undefined } : t));
    }
    
    newSale.items.forEach((saleItem: any) => {
      setIngredients(prevIngs => {
        const updatedIngs = [...prevIngs];
        const product = products.find(p => p.id === saleItem.productId);
        product?.recipe.forEach(recipeItem => {
          const ingIndex = updatedIngs.findIndex(i => i.id === recipeItem.ingredientId);
          if (ingIndex > -1) updatedIngs[ingIndex].stock -= (recipeItem.quantity * saleItem.quantity);
        });
        if (saleItem.mixerId && saleItem.mixerId !== 'manual') {
          const mIndex = updatedIngs.findIndex(i => i.id === saleItem.mixerId);
          if (mIndex > -1) updatedIngs[mIndex].stock -= saleItem.quantity;
        }
        return updatedIngs;
      });
    });

    setSelectedTable(null);
    if (!isMobile) setActiveTab('tables');
  };

  const startShift = (base: number) => {
    setActiveShift({
      id: Math.random().toString(36).substr(2, 9),
      startTime: new Date().toISOString(),
      initialBase: base,
      totalSales: 0,
      totalCard: 0,
      totalCashSales: 0,
      totalExpenses: 0,
      status: 'abierto',
      userId: activeUser.id
    });
  };

  const endShift = (finalCash: number, relevantEvents: SecurityEvent[]) => {
    if (activeShift) {
      const expectedCash = activeShift.initialBase + activeShift.totalCashSales - activeShift.totalExpenses;
      const closedShift: Shift = { ...activeShift, endTime: new Date().toISOString(), finalCash, expectedCash, status: 'cerrado', discrepancyEvents: relevantEvents };
      setShiftHistory(prev => [...prev, closedShift]);
      setActiveShift(null);
      alert(`Turno Cerrado. Resultado: ${finalCash - expectedCash === 0 ? 'Cuadrado' : 'Descuadre de ' + (finalCash - expectedCash).toFixed(2) + '€'}`);
    }
  };

  if (isMobile) {
    return (
      <MobileView 
        tables={tables}
        activeUser={activeUser}
        onSaleComplete={handleSaleComplete}
        onSaveOrder={(id, cart) => setTables(prev => prev.map(t => t.id === id ? { ...t, currentOrder: cart, status: 'ocupada' } : t))}
        onOpenTable={(id, name) => setTables(prev => prev.map(t => t.id === id ? { ...t, status: 'ocupada', tempName: name, currentOrder: [] } : t))}
        onRegisterExpense={handleRegisterExpense}
        isShiftOpen={!!activeShift}
        onNavigateToDashboard={() => setActiveTab('dashboard')}
      />
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
              securityEvents={securityEvents}
              onStartShift={startShift}
              onEndShift={endShift}
              onNavigateToSecurity={() => setActiveTab('security')}
              onQuickExpense={handleRegisterExpense}
            />
          )}
          {activeTab === 'tables' && (
            <TableManager 
              tables={tables} logs={tableLogs}
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
          {activeTab === 'sales_history' && (
            <SalesHistory 
              sales={sales} 
              manualEntries={manualEntries} 
              shiftHistory={shiftHistory} 
              users={users} 
              products={products}
              onUpdateExpenseDocument={handleUpdateExpenseDocument}
            />
          )}
          {activeTab === 'inventory' && <InventoryManager ingredients={ingredients} products={products} onUpdateRecipe={(id, r) => setProducts(p => p.map(pr => pr.id === id ? {...pr, recipe: r} : pr))} onUpdateIngredient={i => setIngredients(inG => inG.map(ig => ig.id === i.id ? i : ig))} onAddIngredient={i => setIngredients(prev => [...prev, i])} onAddProduct={p => setProducts(prev => [...prev, p])} />}
          {activeTab === 'users' && <UserManager users={users} onUpdateUsers={setUsers} />}
          {activeTab === 'waste' && <WasteManager products={products} activeUser={activeUser} onRegisterWaste={handleRegisterWaste} wasteHistory={wastes} />}
          {activeTab === 'security' && <SecurityCamera onDetectedMismatch={(c, a) => setSecurityEvents(p => [...p, { id: Math.random().toString(), timestamp: new Date().toISOString(), cameraValue: c, appPaidValue: a, type: 'mismatch', videoRef: 'REC_AUTO' }])} />}
          {activeTab === 'analytics' && <AIAnalytics ingredients={ingredients} sales={sales} products={products} />}
          {activeTab === 'manual' && <UserManual onBack={() => setActiveTab('dashboard')} />}
        </main>
      </div>
      <footer className="bg-gray-900 text-gray-500 py-4 px-8 text-[10px] font-bold uppercase tracking-[0.2em] flex justify-between items-center border-t border-white/5 no-print">
         <div>EWOLA GASTROSMART v2.6.0</div>
         <div className="flex items-center gap-2">© 2025 EWOLA J21 TECH - MADRID</div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const [globalManualEntries, setGlobalManualEntries] = useState<TaxEntry[]>([]);
  const [globalSales, setGlobalSales] = useState<Sale[]>([]);

  // Función para sincronizar entradas manuales desde cualquier parte
  const handleAddTaxEntry = (entry: TaxEntry) => {
    setGlobalManualEntries(prev => [...prev, entry]);
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={
          <TenantAdmin 
            sales={globalSales} 
            manualEntries={globalManualEntries}
            onAddTaxEntry={handleAddTaxEntry}
          />
        } />
        <Route path="/tpv/:tenantId" element={<TPVMain />} />
        <Route path="/portfolio" element={<div className="bg-white min-h-screen"><Portfolio /></div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
