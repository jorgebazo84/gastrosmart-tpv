
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Camera, 
  Grid3X3,
  LogOut,
  Trash2,
  Settings,
  HelpCircle,
  ExternalLink,
  Users as UsersIcon,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tables', label: 'Salón y Barra', icon: Grid3X3 },
    { id: 'pos', label: 'Terminal Venta', icon: ShoppingCart },
    { id: 'sales_history', label: 'Registro Histórico', icon: History },
    { id: 'inventory', label: 'Stock Recetas', icon: Package },
    { id: 'users', label: 'Equipo y Personal', icon: UsersIcon },
    { id: 'waste', label: 'Control Merma', icon: Trash2 },
    { id: 'analytics', label: 'Inteligencia IA', icon: TrendingUp },
    { id: 'security', label: 'Vigilancia', icon: Camera },
    { id: 'manual', label: 'Manual Uso', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-white border-r h-screen flex flex-col sticky top-0 no-print">
      <div className="p-8">
        <h1 className="text-2xl font-black text-orange-600 flex items-center gap-2 italic">
          TAPAS AI
        </h1>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Smart Coffee System</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${
              activeTab === item.id 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-100 font-bold' 
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <item.icon size={18} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}

        <div className="pt-4 mt-4 border-t border-gray-100">
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center justify-between px-6 py-4 rounded-2xl text-blue-600 font-black text-sm hover:bg-blue-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <Settings size={18} />
              <span>Admin / Fiscal</span>
            </div>
            <ExternalLink size={14} />
          </button>
        </div>
      </nav>

      <div className="p-6 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-red-500 font-bold transition-colors">
          <LogOut size={18} />
          <span className="text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
