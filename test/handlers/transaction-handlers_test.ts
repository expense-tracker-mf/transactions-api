import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assertSpyCallArgs, stub } from "@std/testing/mock";
import createApp from "../../src/app.ts";
import TransactionManager from "../../src/models/transaction-manager.ts";
import { Collection, MongoClient } from "mongodb";
import { Transaction } from "../../src/types.ts";
import { assertEquals } from "@std/assert";

const createTransaction = (userId: string, amount: number): Transaction => {
  return {
    createdAt: new Date(),
    category: "general",
    userId,
    amount,
  };
};

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

describe("serveAllTransactions", () => {
  it("should call getAllTransactions of TransactionManager class", async () => {
    const transactionManager = new TransactionManager(transactionCollection);
    const app = createApp({ transactionManager });
    const transaction1 = createTransaction("user-1", 100);

    const transactions: Transaction[][] = [[], [transaction1]];

    const getAllTransactionsSpy = stub(
      transactionManager,
      "getAllTransactions",
      () => Promise.resolve(transactions.shift() || [])
    );

    const zeroTransactionsResponse = await app.request("/transactions");

    assertEquals(zeroTransactionsResponse.status, 200);
    assertEquals(await zeroTransactionsResponse.json(), []);

    assertSpyCallArgs(getAllTransactionsSpy, 0, ["user-1"]);

    const oneTransactionResponse = await app.request("/transactions");

    assertEquals(oneTransactionResponse.status, 200);
    assertEquals(await oneTransactionResponse.json(), [
      { ...transaction1, createdAt: transaction1.createdAt.toISOString() },
    ]);

    assertSpyCallArgs(getAllTransactionsSpy, 1, ["user-1"]);
  });
});
