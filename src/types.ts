import type { Context } from "hono";

// Define your environment bindings here
export type Env = {
  DB: D1Database;
  AI: Ai;
};

export type AppContext = Context<{ Bindings: Env }>;
export type HandleArgs = [AppContext];
