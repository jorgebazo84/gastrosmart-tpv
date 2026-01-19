
import React, { useState, useEffect } from 'react';
import { getInventoryPredictions } from '../services/geminiService';
import { Ingredient, Sale, Product, PredictionResult, Supplier } from '../types';
import { Brain, Calendar, ArrowRight, ShoppingCart, Loader2, Bell, Mail, Settings, CheckCircle2, AlertTriangle, X, Truck, PackageCheck, Send } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AIAnalyticsProps {
  ingredients: Ingredient[];
  sales: Sale[];
  products: Product[];
  suppliers?: Supplier[];
  onAddSupplier?: (supplier: Supplier) => void;
}

interface PendingOrder {
  id: string;
  supplierName: string;
  items: { name: string; quantity: number }[];
  status: 'Enviado' | 'Recibido';
  date: string;
}

const AIAnalytics: React.FC<AIAnalyticsProps> = ({ 
  ingredients, 
  sales, 
  products,
  suppliers = [],
  onAddSupplier 
}) => {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertDays, setAlertDays] = useState(10);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      const res = await getInventoryPredictions(ingredients, sales, products);
      setPredictions(res);
      setLoading(false);
    };
    fetchPredictions();
  }, [ingredients, sales, products]);

  const getConsumptionAlerts = () => {
    return predictions.filter(p => {
      const ing = ingredients.find(i => i.id === p.ingredientId);
      const depletionDate = new Date(p.estimatedDepletionDate);
      const today = new Date();
      const diffTime = depletionDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const isLowStock = ing ? ing.stock <= ing.minStock : false;
      const isDepletingSoon = diffDays <= alertDays;
      
      return isLowStock || isDepletingSoon;
    });
  };

  const criticalAlerts = getConsumptionAlerts();

  const handlePlaceAutoOrder = async () => {
    setIsOrdering(true);
    
    // Simular procesamiento de pedidos agrupados por proveedor
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newOrders: PendingOrder[] = [];
    
    // Agrupar predicciones por proveedor
    const ordersBySupplier = new Map<string, { name: string; quantity: number }[]>();
    
    predictions.forEach(p => {
      const ing = ingredients.find(i => i.id === p.ingredientId);
      const supplierId = ing?.supplierId || 'unknown';
      const supplier = suppliers.find(s => s.id === supplierId);
      const sName = supplier?.name || 'Proveedor General';
      
      if (!ordersBySupplier.has(sName)) {
        ordersBySupplier.set(sName, []);
      }
      ordersBySupplier.get(sName)?.push({ name: p.name, quantity: p.recommendedQuantity });
    });

    ordersBySupplier.forEach((items, supplierName) => {
      newOrders.push({
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        supplierName,
        items,
        status: 'Enviado',
        date: new Date().toISOString()
      });
    });

    setPendingOrders(prev => [...newOrders, ...prev]);
    setIsOrdering(false);
    setShowOrderSuccess(true);
    setTimeout(() => setShowOrderSuccess(false), 4000);
  };

  const handleSimulateEmail = () => {
    setEmailStatus('sending');
    setTimeout(() => {
      setEmailStatus('sent');
      setShowEmailModal(true);
      setTimeout(() => setEmailStatus('idle'), 3000);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-500 gap-4">
        <Loader2 className="animate-spin text-orange-600" size={48} />
        <p className="font-medium">Gemini AI analizando históricos y prediciendo consumos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Configuration & Smart Alerts Panel */}
      <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm border-orange-100 bg-gradient-to-br from-white to-orange-50/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100">
              <Bell size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">Vigilancia de Stock Predictiva</h3>
              <p className="text-gray-500 font-medium italic">Anticípate a la rotura de stock antes de que ocurra.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border shadow-sm">
            <div className="px-4 py-2">
              <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Avisar con antelación de</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  className="w-12 font-black text-orange-600 text-xl outline-none"
                  value={alertDays}
                  onChange={e => setAlertDays(parseInt(e.target.value) || 0)}
                />
                <span className="text-sm font-bold text-gray-400">Días</span>
              </div>
            </div>
            <button 
              onClick={handleSimulateEmail}
              disabled={emailStatus !== 'idle' || criticalAlerts.length === 0}
              className={`flex items-center gap-2 px-6 py-4 rounded-xl font-black transition-all shadow-lg ${
                emailStatus === 'sent' ? 'bg-green-600 text-white' : 
                criticalAlerts.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                'bg-gray-900 text-white hover:bg-orange-600 shadow-gray-200'
              }`}
            >
              {emailStatus === 'sending' ? <Loader2 className="animate-spin" size={18} /> : 
               emailStatus === 'sent' ? <CheckCircle2 size={18} /> : <Mail size={18} />}
              {emailStatus === 'sent' ? 'Correo Enviado' : 'Enviar Aviso de Compra'}
            </button>
          </div>
        </div>

        {criticalAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalAlerts.map(alert => {
              const ing = ingredients.find(i => i.id === alert.ingredientId);
              const isBelowMin = ing ? ing.stock <= ing.minStock : false;
              const daysLeft = Math.ceil((new Date(alert.estimatedDepletionDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div key={alert.ingredientId} className={`bg-white p-5 rounded-2xl border flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 ${isBelowMin ? 'border-red-200 bg-red-50/30' : 'border-orange-200'}`}>
                  <div className={`p-3 rounded-xl ${isBelowMin ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <p className="font-black text-gray-800">{alert.name}</p>
                    <p className="text-xs text-gray-400">
                      {isBelowMin ? (
                        <span className="text-red-600 font-bold">¡Stock bajo mínimos!</span>
                      ) : (
                        <>Agotamiento en <span className="text-orange-600 font-bold">{daysLeft} días</span></>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-3 text-green-700">
            <CheckCircle2 size={20} />
            <p className="font-bold">Todo bajo control. El sistema no prevé faltas en los próximos {alertDays} días ni hay stock bajo mínimos.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Brain className="text-orange-600" /> Pronóstico de Demanda Semanal
            </h3>
            <span className="text-sm text-gray-400">Basado en IA y estacionalidad local</span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="recommendedQuantity" radius={[6, 6, 0, 0]}>
                  {predictions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.urgency === 'high' ? '#ef4444' : entry.urgency === 'medium' ? '#f97316' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-orange-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-orange-100 flex flex-col justify-between relative overflow-hidden">
          {showOrderSuccess && (
            <div className="absolute inset-0 bg-green-600 z-20 flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-300">
               <PackageCheck size={64} className="mb-4 animate-bounce" />
               <h3 className="text-2xl font-black uppercase">¡Pedido Enviado!</h3>
               <p className="text-green-100 text-sm mt-2">Los proveedores han recibido la orden de compra automática.</p>
            </div>
          )}

          <div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <ShoppingCart size={24} />
            </div>
            <h3 className="text-2xl font-black mb-2 leading-tight">Sugerencia de Pedido Automático</h3>
            <p className="text-orange-100 opacity-80 font-medium">Previsión para cubrir el próximo fin de semana + {alertDays} días de margen.</p>
          </div>
          
          <div className="space-y-4 my-8">
            {predictions.slice(0, 3).map(p => (
              <div key={p.ingredientId} className="flex items-center justify-between border-b border-white/20 pb-3">
                <span className="font-bold">{p.name}</span>
                <span className="bg-white/20 px-3 py-1 rounded-lg font-black text-sm">+{p.recommendedQuantity} uds</span>
              </div>
            ))}
            {predictions.length > 3 && (
              <p className="text-center text-[10px] uppercase font-black tracking-widest text-orange-200">
                + {predictions.length - 3} artículos adicionales
              </p>
            )}
          </div>

          <button 
            onClick={handlePlaceAutoOrder}
            disabled={isOrdering || predictions.length === 0}
            className="w-full bg-white text-orange-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-orange-50 transition-all shadow-xl shadow-orange-900/20 disabled:opacity-50"
          >
            {isOrdering ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <><Send size={18} /> Realizar Pedido Automático</>
            )}
          </button>
        </div>
      </div>

      {/* Pedidos Recientes */}
      {pendingOrders.length > 0 && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-6 px-4">
            <Truck className="text-orange-600" size={24} />
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Pedidos Recientes Enviados</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingOrders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-[2rem] border shadow-sm group hover:border-orange-200 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {order.id}</span>
                    <h4 className="font-black text-gray-800 uppercase">{order.supplierName}</h4>
                  </div>
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <Send size={10} /> {order.status}
                  </span>
                </div>
                <div className="space-y-2 mb-6">
                   {order.items.slice(0, 2).map((item, i) => (
                     <div key={i} className="flex justify-between text-sm font-medium text-gray-600">
                        <span>{item.name}</span>
                        <span className="font-bold">+{item.quantity}</span>
                     </div>
                   ))}
                   {order.items.length > 2 && (
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Y {order.items.length - 2} artículos más...</p>
                   )}
                </div>
                <div className="flex justify-between items-center border-t pt-4">
                   <span className="text-[10px] font-bold text-gray-400">{new Date(order.date).toLocaleString()}</span>
                   <button className="text-xs font-black text-orange-600 hover:underline uppercase">Ver Albarán</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Simulation Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mail size={20} className="text-orange-400" />
                <span className="font-bold text-sm tracking-tight">VISTA PREVIA DEL CORREO DE ALERTA</span>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="hover:bg-white/10 p-1 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6 font-sans">
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500 font-bold mb-1">DE: <span className="text-orange-600 italic">TapAs AI Smart System</span></p>
                <p className="text-sm text-gray-500 font-bold mb-1">PARA: <span className="text-gray-800">Dueño del Establecimiento</span></p>
                <p className="text-sm text-gray-500 font-bold">ASUNTO: <span className="text-red-600 font-black uppercase">⚠️ Alerta Crítica de Stock - Próximos {alertDays} días</span></p>
              </div>
              
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Hola,</p>
                <p>Nuestro sistema de inteligencia artificial ha detectado que los siguientes ingredientes alcanzarán su <strong>límite mínimo de stock</strong> o se <strong>agotarán por completo</strong> en el intervalo de los próximos {alertDays} días:</p>
                
                <div className="bg-gray-50 rounded-2xl border p-4 space-y-4">
                  {criticalAlerts.map(alert => {
                    const ing = ingredients.find(i => i.id === alert.ingredientId);
                    return (
                      <div key={alert.ingredientId} className="flex justify-between items-start border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                        <div>
                          <p className="font-black text-gray-800">{alert.name}</p>
                          <p className="text-xs text-gray-500">
                            Fecha estimada de agotamiento: <span className="font-bold text-orange-600">{new Date(alert.estimatedDepletionDate).toLocaleDateString()}</span>
                          </p>
                          {ing && ing.stock <= ing.minStock && (
                            <p className="text-[10px] text-red-500 font-black uppercase">Actualmente por debajo del mínimo ({ing.stock} / {ing.minStock} {ing.unit})</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase">Compra Sugerida</p>
                          <p className="font-black text-lg text-orange-600">+{alert.recommendedQuantity} {ing?.unit}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p>Te recomendamos realizar el pedido a tus <strong>proveedores habituales</strong> lo antes posible para evitar interrupciones en el servicio.</p>
                <p className="text-xs text-gray-400 italic">Generado automáticamente por el motor Gemini 3 de TapAs AI.</p>
              </div>

              <button 
                onClick={() => setShowEmailModal(false)}
                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all"
              >
                Cerrar y Revisar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
          <h4 className="font-black text-gray-800 uppercase tracking-widest text-sm">Detalle de Predicciones AI</h4>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
            <Settings size={14} /> Gestión de Proveedores
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Ingrediente</th>
              <th className="px-6 py-4">Fecha Estimada Fin</th>
              <th className="px-6 py-4">Sugerencia Compra</th>
              <th className="px-6 py-4">Prioridad AI</th>
              <th className="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {predictions.map((p) => {
              const depletionDate = new Date(p.estimatedDepletionDate);
              const isCritical = (depletionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= alertDays;
              
              return (
                <tr key={p.ingredientId} className={`hover:bg-gray-50 transition-colors ${isCritical ? 'bg-orange-50/30' : ''}`}>
                  <td className="px-6 py-4 font-bold text-gray-800">{p.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                      <Calendar size={16} className={isCritical ? 'text-orange-600' : ''} />
                      {depletionDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-700">{p.recommendedQuantity} uds</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      p.urgency === 'high' ? 'bg-red-100 text-red-600' : 
                      p.urgency === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {p.urgency === 'high' ? 'Crítica' : p.urgency === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="bg-orange-50 text-orange-600 p-2 rounded-xl hover:bg-orange-600 hover:text-white transition-all ml-auto">
                      <ShoppingCart size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AIAnalytics;
