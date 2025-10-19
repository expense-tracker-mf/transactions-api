import { SessionManager } from "./models/session-manager.ts";
import TransactionManager from "./models/transaction-manager.ts";

interface Transaction {
  userId: number;
  amount: number;
  description?: string;
  category: string;
  createdAt: Date;
}

interface AppContext {
  transactionManager: TransactionManager;
  sessionManager: SessionManager;
}

interface AppVariables {
  transactionManager: TransactionManager;
  sessionManager: SessionManager;
  userId: number;
}

interface User {
  user_id: number;
  username: string;
  password: string;
}

interface Session {
  session_id: number;
  user_id: number;
}

export type { Transaction, AppContext, AppVariables, User, Session };
