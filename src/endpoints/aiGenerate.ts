import { OpenAPIRoute, contentJson } from 'chanfana';
import { z } from 'zod';
import type { AppContext } from '../types'; // Updated to point to your types file

export class AIGenerateEndpoint extends OpenAPIRoute {
  schema = {
    request: {
      body: contentJson(
        z.object({
          prompt: z.string(),
          model: z.string().default('@cf/meta/llama-3-8b-instruct'),
        })
      ),
    },
    responses: {
      '200': {
        description: 'Successful AI generation response',
        ...contentJson(
          z.object({
            result: z.any(),
          })
        ),
      },
    },
  };

      async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const { prompt, model } = data.body;

    try {
      const response = await c.env.AI.run(model, {
        // 1. Use the chat format instead of a raw prompt
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: prompt }
        ],
        // 2. Increase the output length (up to 2048/4096 depending on the model)
        max_tokens: 1024 
      });

      return {
        result: response,
      };
    } catch (error: any) {
      return Response.json({
        success: false,
        message: "AI Execution Failed",
        details: error.message || String(error)
      }, { status: 500 });
    }
  }
