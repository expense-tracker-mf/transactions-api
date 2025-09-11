import { Context, Hono, MiddlewareHandler, Next } from "hono";
import { AppContext, AppVariables } from "./types.ts";
import { serveAllTransactions } from "./handlers/transaction-handlers.ts";

const setupAppContext =
  (appContext: AppContext): MiddlewareHandler =>
  async (ctx: Context, next: Next) => {
    const { transactionManager } = appContext;
    ctx.set("transactionManager", transactionManager);

    return await next();
  };

const createApp = (
  appContext: AppContext
): Hono<{ Variables: AppVariables }> => {
  const app = new Hono<{ Variables: AppVariables }>();

  app.use(setupAppContext(appContext));
  app.get("/transactions", serveAllTransactions);

  return app;
};

export default createApp;
