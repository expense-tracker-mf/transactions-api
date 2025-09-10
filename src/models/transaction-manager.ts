import { Collection } from "mongodb";
import { Transaction } from "../types.ts";

class TransactionManager {
  constructor(private readonly collection: Collection<Transaction>) {}

  async getAllTransactions(userId: string): Promise<Transaction[]> {
    return await this.collection.find({ userId }).toArray();
  }
}

export default TransactionManager;
