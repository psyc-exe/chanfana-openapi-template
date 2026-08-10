import { OpenAPIRoute, contentJson } from 'chanfana';
import { z } from 'zod';
import { type AppContext, type Env } from './index';

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
    const data = await this.getValidatedData();
    const { prompt, model } = data.body;

    // Run Cloudflare Workers AI model via the binding
    const response = await c.env.AI.run(model, {
      prompt: prompt,
    });

    return {
      result: response,
    };
  }
}
