import { GoogleGenAI, Type } from "@google/genai";
import { Ingredient, Sale, PredictionResult, Product, TaxEntry } from "../types";

export const getInventoryPredictions = async (
  ingredients: Ingredient[],
  sales: Sale[],
  products: Product[]
): Promise<PredictionResult[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === '' || apiKey === 'undefined') {
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });

  const context = {
    negocio: "Cafetería Local en España",
    inventario_actual: ingredients.map(i => ({ 
      id: i.id, 
      nombre: i.name, 
      stock_actual: i.stock, 
      minimo_seguridad: i.minStock,
      unidad: i.unit 
    })),
    historico_ventas_reciente: sales.map(s => ({ 
      fecha: s.timestamp, 
      items: s.items,
      metodo: s.paymentMethod 
    })),
    maestro_recetas: products.map(p => ({ 
      nombre: p.name, 
      composicion: p.recipe 
    }))
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analiza este inventario y predice faltas: ${JSON.stringify(context)}`,
      config: {
        systemInstruction: "Actúa como experto en logística de hostelería española. Devuelve JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ingredientId: { type: Type.STRING },
              name: { type: Type.STRING },
              estimatedDepletionDate: { type: Type.STRING },
              recommendedQuantity: { type: Type.NUMBER },
              urgency: { type: Type.STRING, enum: ['high', 'medium', 'low'] }
            },
            required: ["ingredientId", "name", "estimatedDepletionDate", "recommendedQuantity", "urgency"]
          }
        }
      }
    });
    
    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (e: any) {
    if (e?.status === 503 || e?.message?.includes('503') || e?.message?.includes('overloaded')) {
      console.warn("IA de Inventario: El servidor está sobrecargado. Se intentará en la próxima actualización.");
    } else {
      console.error("Error en predicción IA:", e);
    }
    return [];
  }
};

export const analyzeReceipt = async (base64Image: string): Promise<Partial<TaxEntry>> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === '' || apiKey === 'undefined') {
    return {};
  }

  const ai = new GoogleGenAI({ apiKey });

  const imagePart = {
    inlineData: {
      data: base64Image.split(',')[1],
      mimeType: 'image/jpeg'
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, { text: "Extrae: concepto, base, taxRate (decimal), total en JSON." }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concept: { type: Type.STRING },
            base: { type: Type.NUMBER },
            taxRate: { type: Type.NUMBER },
            total: { type: Type.NUMBER }
          },
          required: ["concept", "base", "taxRate", "total"]
        }
      }
    });
    
    const text = response.text;
    return text ? JSON.parse(text) : {};
  } catch (e: any) {
    if (e?.status === 503 || e?.message?.includes('503')) {
      alert("El motor de IA está temporalmente sobrecargado. Por favor, reintenta el escaneo en unos segundos.");
    } else {
      console.error("Error en análisis de ticket IA:", e);
    }
    return {};
  }
};