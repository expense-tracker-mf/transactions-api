import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { Collection, MongoClient } from "mongodb";
import { Transaction } from "../../src/types.ts";
import TransactionManager from "../../src/models/transaction-manager.ts";
import { assert, assertEquals } from "@std/assert";

let client: MongoClient;
let transactionCollection: Collection<Transaction>;

beforeEach(async () => {
  client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("test");
  transactionCollection = database.collection("transactions");

  await transactionCollection.deleteMany({});
});

afterEach(async () => {
  await transactionCollection.deleteMany({});
  await client.close();
});

const createTransaction = (userId: string, amount: number): Transaction => {
  return {
    createdAt: new Date(),
    category: "general",
    userId,
    amount,
  };
};

describe("init", () => {
  it("should create an instance of Transaction with mongo collection", () => {
    const transaction = new TransactionManager(transactionCollection);

    assert(transaction instanceof TransactionManager);
  });
});

describe("getAllTransactions", () => {
  it("should return empty array when there are no transactions", async () => {
    const transactionManager = new TransactionManager(transactionCollection);
    const userId = "user-1";
    const transactions = await transactionManager.getAllTransactions(userId);

    assert(Array.isArray(transactions));
    assert(transactions.length === 0);
  });

  it("should return all transactions for a user", async () => {
    const transactionManager = new TransactionManager(transactionCollection);
    const userId = "user-1";

    const transaction1 = createTransaction(userId, 100);
    const transaction2 = createTransaction(userId, 200);

    await transactionCollection.insertMany([transaction1, transaction2]);

    const transactions = await transactionManager.getAllTransactions(userId);

    assert(Array.isArray(transactions));
    assert(transactions.length === 2);
    assertEquals(transactions, [transaction1, transaction2]);
  });
});
