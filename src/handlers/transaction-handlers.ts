import { Context } from "hono";
import { AppVariables } from "../types.ts";

const serveAllTransactions = async (
  ctx: Context<{ Variables: AppVariables }>
) => {
  const transactionManager = ctx.get("transactionManager");
  const transactions = await transactionManager.getAllTransactions("user-1");

  return ctx.json(transactions);
};

export { serveAllTransactions };
