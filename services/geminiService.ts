import { GoogleGenAI, Type } from "@google/genai";
import { Ingredient, Sale, PredictionResult, Product, TaxEntry } from "../types";

// Función auxiliar para inicializar la IA de forma segura
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === '' || apiKey === 'undefined' || apiKey.length < 10) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getInventoryPredictions = async (
  ingredients: Ingredient[],
  sales: Sale[],
  products: Product[]
): Promise<PredictionResult[]> => {
  const ai = getAIClient();
  if (!ai) return [];

  const context = {
    negocio: "Cafetería Local en España",
    inventario_actual: ingredients.map(i => ({ 
      id: i.id, 
      nombre: i.name, 
      stock_actual: i.stock, 
      minimo_seguridad: i.minStock,
      unidad: i.unit 
    })),
    historico_ventas_reciente: sales.slice(0, 50).map(s => ({ 
      fecha: s.timestamp, 
      items: s.items,
      total: s.total 
    })),
    maestro_recetas: products.map(p => ({ 
      nombre: p.name, 
      composicion: p.recipe 
    }))
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analiza este inventario y predice faltas para una cafetería española: ${JSON.stringify(context)}`,
      config: {
        systemInstruction: "Actúa como experto en logística de hostelería española. Devuelve un array JSON de predicciones.",
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
    
    return response.text ? JSON.parse(response.text) : [];
  } catch (e: any) {
    console.warn("IA de Inventario: Error o sobrecarga.", e.message);
    return [];
  }
};

export const analyzeReceipt = async (base64Image: string): Promise<Partial<TaxEntry>> => {
  const ai = getAIClient();
  if (!ai) return {};

  const imagePart = {
    inlineData: {
      data: base64Image.split(',')[1],
      mimeType: 'image/jpeg'
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, { text: "Extrae de este ticket de compra: concepto (proveedor), base imponible, taxRate (IVA decimal), total en JSON." }] },
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
    
    return response.text ? JSON.parse(response.text) : {};
  } catch (e: any) {
    console.error("Error en análisis de ticket IA:", e);
    return {};
  }
};