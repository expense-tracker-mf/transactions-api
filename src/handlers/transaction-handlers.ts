import { Context } from "hono";
import { AppVariables } from "../types.ts";

const serveAllTransactions = async (
  ctx: Context<{ Variables: AppVariables }>
) => {
  const transactionManager = ctx.get("transactionManager");
  const userId = ctx.get("userId");
  const transactions = await transactionManager.getAllTransactions(userId);

  return ctx.json(transactions);
};

export { serveAllTransactions };
