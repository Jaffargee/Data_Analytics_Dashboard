import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: import.meta.env.VITE_OPEN_ROUTER_API_KEY as string
});


export async function openrouter_llm_query(query: string, systemInstruction?: string): Promise<string | undefined | null> {
      // Stream the response to get reasoning tokens in usage
      const stream = await openrouter.chat.send({
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
            stream: true
      });
      
      let response = "";
      for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                  response += content;
                  process.stdout.write(content);
            }
            
            // Usage information comes in the final chunk
            if (chunk.usage) {
                  console.log("\nReasoning tokens:", chunk.usage.reasoningTokens);
            }
      }

      return response;
}
    