import { Context, Hono, MiddlewareHandler, Next } from "hono";
import { getCookie } from "hono/cookie";
import { AppContext, AppVariables } from "./types.ts";
import { serveAllTransactions } from "./handlers/transaction-handlers.ts";

const setupAppContext =
  (appContext: AppContext): MiddlewareHandler =>
  async (ctx: Context, next: Next) => {
    const { transactionManager, sessionManager } = appContext;
    ctx.set("transactionManager", transactionManager);
    ctx.set("sessionManager", sessionManager);

    return await next();
  };

const authenticateUserAndSetUserContext: MiddlewareHandler = async (
  ctx: Context<{ Variables: AppVariables }>,
  next: Next
) => {
  const sessionId = Number(getCookie(ctx, "sessionId"));
  const sessionManager = ctx.get("sessionManager");

  if (!(await sessionManager.hasSession(sessionId)))
    return ctx.json({ message: "Unauthorized" }, 401);

  const session = (await sessionManager.getSessionById(sessionId))!;

  ctx.set("userId", session.user_id);

  return await next();
};

const createApp = (
  appContext: AppContext
): Hono<{ Variables: AppVariables }> => {
  const app = new Hono<{ Variables: AppVariables }>();

  app.use(setupAppContext(appContext));
  app.use(authenticateUserAndSetUserContext);
  app.get("/transactions", serveAllTransactions);

  return app;
};

export default createApp;
