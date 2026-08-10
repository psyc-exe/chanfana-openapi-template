import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../types";

export class AIGenerateEndpoint extends OpenAPIRoute {
  schema = {
    request: {
      body: contentJson(
        z.object({
          prompt: z.string(),
          model: z.string().default("@cf/meta/llama-3.1-8b-instruct"),
        })
      ),
    },
    responses: {
      "200": {
        description: "Successful AI generation response",
        ...contentJson(
          z.object({
            result: z.any(),
          })
        ),
      },
      "500": {
        description: "Internal Server Error",
        ...contentJson(
          z.object({
            success: z.boolean(),
            message: z.string(),
            details: z.string().optional(),
          })
        ),
      },
    },
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const { prompt, model } = data.body;

    try {
      const response = await c.env.AI.run(
        model,
        {
          messages: [
            { role: "system", content: "You are a helpful AI assistant." },
            { role: "user", content: prompt },
          ],
          max_tokens: 1024,
        },
        {
          gateway: {
            id: "acode",
          },
        }
      );

      return {
        result: response,
      };
    } catch (error: any) {
      return Response.json(
        {
          success: false,
          message: "AI Execution Failed",
          details: error.message || String(error),
        },
        { status: 500 }
      );
    }
  }
}
