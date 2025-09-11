import TransactionManager from "./models/transaction-manager.ts";

interface Transaction {
  userId: string;
  amount: number;
  description?: string;
  category: string;
  createdAt: Date;
}

interface AppContext {
  transactionManager: TransactionManager;
}

interface AppVariables {
  transactionManager: TransactionManager;
}

export type { Transaction, AppContext, AppVariables };
