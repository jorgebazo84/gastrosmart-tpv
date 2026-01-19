
import React from 'react';
import { 
  BookOpen, CheckCircle, Package, ShoppingCart, UserCheck, 
  TrendingUp, ShieldCheck, FileText, ArrowLeft, Printer,
  Settings, Calculator, Camera, HardDrive, Smartphone,
  Info, Zap, Truck, Receipt
} from 'lucide-react';

interface UserManualProps {
  onBack?: () => void;
}

const UserManual: React.FC<UserManualProps> = ({ onBack }) => {
  // Move Brain declaration before usage and make className optional
  const Brain = ({ size, className }: { size: number, className?: string }) => <TrendingUp size={size} className={className} />;

  const setupSteps = [
    {
      title: "1. Identidad y Fiscalidad",
      desc: "Accede a 'Admin / Fiscal'. Configura tu NIF, dirección y régimen fiscal (Estimación Directa o Módulos). Define tus colores de marca y el logotipo que aparecerá en los tickets.",
      icon: Settings,
      color: "bg-gray-100 text-gray-600"
    },
    {
      title: "2. Proveedores y Almacén",
      desc: "Registra tus proveedores habituales en 'Inteligencia IA'. Luego, añade tus 'Ingredientes' en bruto: Barriles de cerveza (L), botellas de vino (unid) o kilos de café.",
      icon: Truck,
      color: "bg-orange-100 text-orange-600"
    },
    {
      title: "3. Escandallos (Recetas)",
      desc: "Crea tus 'Productos' de venta. Por cada producto, define su receta exacta: ej. una Caña usa '0.20 L' del ingrediente 'Barril Cerveza'. Esto garantiza un stock real al milímetro.",
      icon: Package,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "4. Periféricos de Pago",
      desc: "Conecta tu cajón inteligente CashGuard o terminal ITOS mediante IP en la pestaña 'Hardware'. Activa el modo 'Estricto' si quieres que el TPV bloquee descuadres manuales.",
      icon: HardDrive,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const operationalSections = [
    {
      title: "Venta y Terminal (POS)",
      items: [
        "Apertura de Turno: Introduce la base en efectivo para iniciar la jornada.",
        "Gestión de Mesas: Abre mesas con nombres temporales (ej. 'Mesa 4 - Juan').",
        "Combinados Inteligentes: Al elegir un destilado, el sistema pide el mixer (refresco) automáticamente.",
        "Venta Rápida: Usa el botón 'Rayo' para ventas directas en barra sin asignar mesa."
      ],
      icon: ShoppingCart
    },
    {
      title: "Inteligencia Artificial Gemini",
      items: [
        "Predicción de Compras: La IA analiza ventas pasadas y sugiere pedidos a proveedores.",
        "Vigilancia de Caja: La cámara reconoce billetes y detecta si el importe coincide con el cobro.",
        "OCR de Facturas: Saca una foto a cualquier ticket de compra y la IA extraerá base e IVA para tu contabilidad."
      ],
      icon: Brain
    },
    {
      title: "Administración y Hacienda",
      items: [
        "Modelos Fiscales: El sistema calcula automáticamente los modelos 303 (IVA), 130 (IRPF), 111 y 115.",
        "Registro de Gastos: Documenta salidas de caja (pan, reparaciones) vinculando foto del ticket.",
        "Control de Merma: Registra roturas o invitaciones para que el stock no descuadre."
      ],
      icon: Calculator
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-16 animate-in fade-in duration-700">
      <div className="flex justify-start mb-4 no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-orange-600 font-bold transition-all text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={18} /> Volver al Sistema
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-orange-600 text-white rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-orange-100">
          <BookOpen size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-gray-900 uppercase tracking-tighter">Manual GastroSmart <span className="text-orange-600 italic">AI</span></h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">La guía definitiva para digitalizar tu cafetería y delegar la gestión pesada en la Inteligencia Artificial.</p>
        </div>
      </div>

      {/* Setup Guide */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b pb-4">
          <Settings className="text-orange-600" size={24} />
          <h2 className="text-2xl font-black text-gray-800 uppercase">Configuración desde Cero</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {setupSteps.map((step, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border shadow-sm hover:shadow-md transition-all">
              <div className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center mb-4`}>
                <step.icon size={24} />
              </div>
              <h3 className="font-black text-gray-800 mb-2 text-sm uppercase tracking-tight">{step.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Operational Modules */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {operationalSections.map((section, i) => (
          <div key={i} className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-orange-600">
                <section.icon size={24} />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">{section.title}</h3>
            </div>
            <ul className="space-y-4">
              {section.items.map((item, idx) => (
                <li key={idx} className="flex gap-3 items-start group">
                  <div className="mt-1.5 w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0 group-hover:scale-150 transition-transform"></div>
                  <p className="text-sm text-gray-600 font-medium leading-snug">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Special Logic Explanation */}
      <div className="bg-orange-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-orange-100 flex flex-col md:flex-row items-center gap-10">
        <div className="shrink-0">
          <Info size={80} className="text-orange-200" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black uppercase">¿Cómo funciona el Stock?</h2>
          <p className="text-orange-50 font-medium text-lg leading-relaxed">
            A diferencia de otros TPVs, GastroSmart AI no descuenta "unidades" de forma genérica. Si configuras que tu <strong>Barril de 50L</strong> tiene un coste de 90€, y tu <strong>Copa</strong> lleva 0.33L, el sistema calculará el coste exacto de esa copa y restará esos 33cl del inventario global. Esto permite que el dueño pueda verificar desde casa cuánto líquido queda exactamente en los barriles o cuántas copas han salido de una botella de vino específica.
          </p>
        </div>
      </div>

      {/* Support CTA */}
      <div className="bg-gray-900 rounded-[3rem] p-12 text-center space-y-8">
        <div className="flex justify-center gap-8 opacity-50 grayscale">
          <ShieldCheck size={40} className="text-white" />
          <Smartphone size={40} className="text-white" />
          <Receipt size={40} className="text-white" />
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-white uppercase">¿Necesitas ayuda técnica?</h3>
          <p className="text-gray-400 font-medium max-w-xl mx-auto">
            Nuestro equipo de soporte está disponible 24/7 para integraciones de CashGuard, configuración de cámaras neuronal o dudas sobre exportación fiscal para tu gestoría.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => window.print()}
            className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20 flex items-center gap-2"
          >
            <Printer size={18} /> Imprimir Manual Completo
          </button>
          <button className="px-10 py-4 bg-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all">
            Contactar Soporte EWOLA
          </button>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.5em] pb-10">
        GastroSmart AI // Versión del Documento 2025.01.A
      </p>
    </div>
  );
};

export default UserManual;
