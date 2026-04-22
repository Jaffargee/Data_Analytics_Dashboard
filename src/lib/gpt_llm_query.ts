import OpenAI from "openai";
const client = new OpenAI({ baseURL: "https://api.aimlapi.com/v1", apiKey: import.meta.env.VITE_AIML_CLAUDE_API_KEY as string, dangerouslyAllowBrowser: true });

export async function gpt_llm_query(query: string, systemInstruction?: string): Promise<string | undefined | null> {

      const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
                  {
                        role: "system",
                        content: systemInstruction ?? ""
                  },
                  {
                        role: "user",
                        content: query
                  }
            ]
      });

      return response.choices[0].message.content

}