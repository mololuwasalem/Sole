import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function categorizeTransaction(description: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Categorize the following transaction description into one of these categories: Food, Transport, Housing, Entertainment, Utilities, Healthcare, Shopping, Income, Others.
      Description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return data.category || 'Others';
  } catch (error) {
    console.error('Categorization error:', error);
    return 'Others';
  }
}
