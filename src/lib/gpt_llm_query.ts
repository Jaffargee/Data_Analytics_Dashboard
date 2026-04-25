import OpenAI from "openai";
const client = new OpenAI({ baseURL: "https://openrouter.ai/api/v1", apiKey: import.meta.env.VITE_OPEN_ROUTER_API_KEY as string, dangerouslyAllowBrowser: true });

export async function gpt_llm_query(query: string, systemInstruction?: string): Promise<string | undefined | null> {

      const response = await client.chat.completions.create({
            model: "openai/gpt-oss-120b:free",
            messages: [
                  {
                        role: "system",
                        content: systemInstruction ?? ""
                  },
                  {
                        role: "user",
                        content: query
                  }
            ],
      });

      return response.choices[0].message.content

}