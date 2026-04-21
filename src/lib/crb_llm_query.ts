import Cerebras from '@cerebras/cerebras_cloud_sdk';


const cerebras = new Cerebras({
      apiKey: import.meta.env.VITE_CEREBRAS_API_KEY
});

export const crb_llm_query = async (query: string, systemInstruction: string ): Promise<string | undefined> => {
      const response = await cerebras.chat.completions.create({
            model: "qwen-3-235b-a22b-instruct-2507",
            messages: [
                  {
                        role: "system",
                        content: systemInstruction as string
                  },
                  {
                        role: "user",
                        content: query
                  }
            ]
      }) as any;
      // Use optional chaining and nullish coalescing for safety
      const content = response.choices?.[0]?.message?.content;

      if (!content) {
            throw new Error("Invalid response or empty content from Cerebras API");
      }

      return content;
}