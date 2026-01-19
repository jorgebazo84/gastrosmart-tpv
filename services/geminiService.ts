
import { GoogleGenAI, Type } from "@google/genai";
import { Ingredient, Sale, PredictionResult, Product, TaxEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInventoryPredictions = async (
  ingredients: Ingredient[],
  sales: Sale[],
  products: Product[]
): Promise<PredictionResult[]> => {
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

  const systemInstruction = `
    Actúa como un experto en control de gestión y logística para hostelería española. 
    Analiza los datos para predecir roturas de stock y sugerir pedidos óptimos.
    Devuelve la respuesta estrictamente en JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Datos del negocio: ${JSON.stringify(context)}`,
    config: {
      systemInstruction,
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

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
};

/**
 * Escanea un ticket/factura usando IA para extraer datos fiscales.
 */
export const analyzeReceipt = async (base64Image: string): Promise<Partial<TaxEntry>> => {
  const systemInstruction = `
    Eres un experto contable español. Analiza la imagen de la factura/ticket.
    Extrae: Concepto (Nombre del proveedor), Base Imponible, Tipo de IVA (en decimal, ej: 0.21), y Total.
    Si no encuentras el IVA, asume 0.21.
    Responde estrictamente en JSON.
  `;

  const imagePart = {
    inlineData: {
      data: base64Image.split(',')[1],
      mimeType: 'image/jpeg'
    }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, { text: "Extrae los datos fiscales de este ticket español." }] },
    config: {
      systemInstruction,
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

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Error OCR Gemini:", e);
    return {};
  }
};
