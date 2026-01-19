
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, ChevronRight, LayoutDashboard, ShieldCheck, Sparkles, Globe, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [tenantName, setTenantName] = useState('');
  const navigate = useNavigate();

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (tenantName.trim()) {
      const slug = tenantName.toLowerCase().replace(/\s+/g, '-');
      navigate(`/tpv/${slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden selection:bg-orange-100">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-2xl font-black text-orange-600 italic">
          <Coffee size={32} />
          TAPAS AI
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500">
          <button onClick={() => navigate('/portfolio')} className="hover:text-orange-600 transition-colors">Funcionalidades</button>
          <a href="#" className="hover:text-orange-600 transition-colors">Precios</a>
          <button onClick={() => navigate('/tpv/demo')} className="bg-gray-900 text-white px-6 py-3 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-gray-200">
            Acceso Clientes
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Sparkles size={16} />
              El TPV Inteligente #1 de España
            </div>
            <h1 className="text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-8">
              Gestiona tu <span className="text-orange-600">Cafetería</span> con Inteligencia Real.
            </h1>
            <p className="text-xl text-gray-500 mb-10 max-w-lg leading-relaxed">
              Desde el control de barriles por receta hasta la predicción de compras con IA. La solución definitiva para bares de barrio y grandes franquicias.
            </p>

            <div className="bg-white p-2 rounded-[2rem] border-2 border-gray-100 shadow-2xl max-w-md">
              <form onSubmit={handleAccess} className="flex gap-2">
                <input 
                  type="text" 
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="Nombre de tu negocio..." 
                  className="flex-1 bg-transparent px-6 py-4 outline-none font-medium text-gray-700"
                  required
                />
                <button type="submit" className="bg-orange-600 text-white p-4 rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100">
                  <ArrowRight size={24} />
                </button>
              </form>
            </div>
            
            <div className="mt-8 flex items-center gap-6">
              <button 
                onClick={() => navigate('/tpv/demo')}
                className="flex items-center gap-2 text-gray-400 font-bold hover:text-orange-600 transition-colors"
              >
                ¿Quieres ver una demo? <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="relative">
            {/* Abstract Background Shapes */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute top-40 -left-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative bg-gray-50 rounded-[3rem] border-8 border-white shadow-2xl overflow-hidden aspect-square flex items-center justify-center group">
              <div className="grid grid-cols-2 gap-4 p-8 w-full h-full">
                <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col justify-between animate-float" style={{ animationDelay: '0s' }}>
                  <LayoutDashboard className="text-orange-600" size={32} />
                  <p className="font-black text-gray-800 text-lg">Dashboard IA</p>
                </div>
                <div className="bg-orange-600 rounded-3xl shadow-xl p-6 text-white flex flex-col justify-between animate-float" style={{ animationDelay: '1s' }}>
                  <ShieldCheck size={32} />
                  <p className="font-black text-lg">Caja Segura</p>
                </div>
                <div className="bg-gray-900 rounded-3xl shadow-xl p-6 text-white flex flex-col justify-between animate-float" style={{ animationDelay: '0.5s' }}>
                  <Globe size={32} />
                  <p className="font-black text-lg">Cloud Sync</p>
                </div>
                <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col justify-between animate-float" style={{ animationDelay: '1.5s' }}>
                  <Coffee className="text-orange-600" size={32} />
                  <p className="font-black text-gray-800 text-lg">Gestión Mesas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-black text-gray-400">
            © 2025 TAPAS AI SOLUTIONS SL. Madrid, España.
          </div>
          <div className="flex gap-8 text-sm font-bold text-gray-400">
            <a href="#" className="hover:text-orange-600">Privacidad</a>
            <a href="#" className="hover:text-orange-600">Términos</a>
            <a href="#" className="hover:text-orange-600">Soporte 24/7</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
