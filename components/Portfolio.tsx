
import React from 'react';
import { Star, Shield, TrendingUp, Cpu, Smartphone, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Portfolio: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex justify-start mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-orange-600 font-bold transition-all text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={18} /> Volver
        </button>
      </div>

      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">
          El TPV que entiende tu <span className="text-orange-600 underline">Barrio</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Diseñado específicamente para las cafeterías españolas que necesitan control total, desde el barril hasta la terraza.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-20">
        {[
          { title: 'Inventario Inteligente', icon: Cpu, desc: 'Gestión por recetas: descontamos litros de barril por cada caña servida automáticamente.' },
          { title: 'Control Remoto', icon: Globe, desc: 'Vigila tus ventas y el stock en tiempo real desde tu casa o desde el mercado.' },
          { title: 'IA Predictiva', icon: TrendingUp, desc: 'Nuestro motor Gemini AI te dice cuánto comprar según el tiempo y los festivos locales.' },
          { title: 'Caja Blindada', icon: Shield, desc: 'Integración con CashGuard e ITOS para que no falte ni un céntimo al final del día.' },
          { title: 'Gestión de Mesas', icon: Smartphone, desc: 'Pasa comandas de la barra a la terraza con un solo gesto. Olvida los papeles.' },
          { title: 'Pre-tickets Pro', icon: Star, desc: 'Servicio impecable. Entrega la cuenta antes de cobrar con formato profesional.' },
        ].map((feat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <feat.icon size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
            <p className="text-gray-500 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-orange-600 rounded-[3rem] p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">¿Listo para modernizar tu negocio?</h2>
        <p className="text-orange-100 mb-8 max-w-lg mx-auto">Únete a las más de 200 cafeterías que ya han optimizado sus compras un 22% gracias a nuestra IA.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-white text-orange-600 px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-transform"
        >
          SOLICITAR DEMO GRATIS
        </button>
      </div>
    </div>
  );
};

export default Portfolio;
