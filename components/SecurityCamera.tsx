
import React, { useRef, useEffect, useState } from 'react';
import { Camera, AlertCircle, Scan, History, Search, Video, Eye, X, Play, ShieldAlert } from 'lucide-react';

interface SecurityCameraProps {
    onDetectedMismatch?: (camera: number, app: number) => void;
    onDetectedValue?: (val: number) => void;
}

const SecurityCamera: React.FC<SecurityCameraProps> = ({ onDetectedMismatch, onDetectedValue }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [detections, setDetections] = useState<{ label: string; value: number; x: number; y: number; width: number; height: number }[]>([]);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (!mounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          currentStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            try {
              await videoRef.current.play();
              if (mounted) setIsStreaming(true);
            } catch (playError) {
              console.debug("Playback interrupted:", playError);
            }
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const val = Math.random() > 0.5 ? 20 : 10;
        const newDetection = {
          label: `Billete ${val}€`,
          value: val,
          x: 50 + Math.random() * 30,
          y: 30 + Math.random() * 30,
          width: 120,
          height: 80
        };
        setDetections([newDetection]);
        if (onDetectedValue) onDetectedValue(val);
        if (Math.random() > 0.7 && onDetectedMismatch) {
            onDetectedMismatch(val, val === 20 ? 10 : 5);
        }
      } else {
        setDetections([]);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isStreaming, onDetectedValue, onDetectedMismatch]);

  const recentEvents = [
    { time: '12:45:01', event: 'Billete 50€ detectado', status: 'Verificado', ref: 'REC_50_1' },
    { time: '12:44:12', event: 'Apertura de cajón', status: 'Alerta', ref: 'REC_DRAWER_1' },
    { time: '12:40:55', event: 'Billete 10€ detectado', status: 'Verificado', ref: 'REC_10_1' },
    { time: '12:38:22', event: 'Cambio monedas', status: 'Verificado', ref: 'REC_COINS_1' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Caja Blindada EWOLA-VISION</h2>
          <p className="text-gray-500">Inteligencia Artificial para reconocimiento de efectivo en tiempo real.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-gray-600 hover:bg-gray-50">
            <History size={18} /> Historial
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative bg-black rounded-[3rem] overflow-hidden shadow-2xl aspect-video border-4 border-gray-800">
          {!isStreaming && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4">
              <Video size={48} className="animate-pulse" />
              <p className="font-bold uppercase text-[10px] tracking-widest">Enlazando con el procesador neuronal...</p>
            </div>
          )}
          <video 
            ref={videoRef} 
            className={`w-full h-full object-cover transition-opacity duration-500 ${isStreaming ? 'opacity-70' : 'opacity-0'}`}
            muted
            playsInline
          />
          
          {detections.map((det, i) => (
            <div 
              key={i}
              className="absolute border-2 border-green-400 bg-green-400/10 transition-all duration-500 z-10"
              style={{
                left: `${det.x}%`,
                top: `${det.y}%`,
                width: `${det.width}px`,
                height: `${det.height}px`
              }}
            >
              <div className="absolute -top-6 left-0 bg-green-400 text-black text-[10px] px-2 font-black rounded flex items-center gap-1 shadow-lg">
                <Scan size={10} /> {det.label} (99.2%)
              </div>
            </div>
          ))}

          <div className="absolute top-6 left-6 flex items-center gap-2 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse z-20">
            <div className="w-2 h-2 bg-white rounded-full"></div> REC LIVE // EWOLA_CAM_01
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
            <h3 className="font-black text-gray-800 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
              <Scan size={16} className="text-orange-600" /> Eventos en Memoria
            </h3>
            <div className="space-y-3">
              {recentEvents.map((ev, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-orange-50 transition-all group">
                  <div>
                    <p className="text-[10px] text-gray-400 font-mono font-bold">{ev.time}</p>
                    <p className="text-xs font-black text-gray-700 uppercase">{ev.event}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedClip(ev.ref)}
                    className="p-2 bg-white border rounded-xl text-gray-400 hover:text-orange-600 hover:scale-110 transition-all shadow-sm"
                    title="Vista previa clip"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-orange-100 flex items-start gap-4">
              <ShieldAlert className="shrink-0 mt-1" />
              <div>
                <h4 className="font-black uppercase text-xs">Protección EWOLA</h4>
                <p className="text-sm text-orange-100 mt-1 font-medium leading-relaxed">
                  Sistema de auditoría visual conectado al TPV. Cada discrepancia queda grabada y etiquetada automáticamente.
                </p>
              </div>
          </div>
        </div>
      </div>

      {/* Modal Vista Previa Clip */}
      {selectedClip && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="bg-gray-900 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
              <div className="p-6 bg-gray-800/50 flex justify-between items-center text-white border-b border-white/5">
                 <div className="flex items-center gap-3">
                    <Play className="text-orange-500" fill="currentColor" size={20} />
                    <div>
                       <h3 className="font-black uppercase text-xs tracking-widest">Reproduciendo: {selectedClip}</h3>
                       <p className="text-[10px] text-gray-400 font-bold">FECHA: 2025-01-20 // CAM_01_CAJA</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedClip(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
              </div>
              <div className="aspect-video bg-black flex items-center justify-center relative">
                 <p className="text-white/20 font-black text-6xl uppercase italic tracking-tighter -rotate-12 select-none">REPLAY SIMULATION</p>
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                       <div className="h-full bg-orange-600 w-1/3"></div>
                    </div>
                 </div>
              </div>
              <div className="p-6 bg-gray-800/50 flex justify-center gap-4">
                 <button className="px-6 py-2 bg-white/10 text-white rounded-xl font-bold text-xs uppercase hover:bg-white/20 transition-all">Exportar MP4</button>
                 <button className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-orange-700 transition-all">Ver Venta Asociada</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SecurityCamera;
