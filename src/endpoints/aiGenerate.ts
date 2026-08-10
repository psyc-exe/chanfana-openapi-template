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
      // Try to run the AI model
      const response = await c.env.AI.run(model, {
        prompt: prompt,
      });

      return {
        result: response,
      };
    } catch (error: any) {
      // If it crashes, return the EXACT error message to the Swagger UI
      return Response.json({
        success: false,
        message: "AI Execution Failed",
        details: error.message || String(error)
      }, { status: 500 });
    }
  }



