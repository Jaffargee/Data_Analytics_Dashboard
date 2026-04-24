import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string });


export async function llm_query(model: string, query: string, systemInstruction?: string): Promise<string | undefined> {
      const response = await ai.models.generateContent({
            model: model,
            contents: query,
            config: {
                  systemInstruction: systemInstruction
            }
      });

      return response.text
}

