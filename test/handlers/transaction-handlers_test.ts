import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assertSpyCallArgs, stub } from "@std/testing/mock";
import createApp from "../../src/app.ts";
import TransactionManager from "../../src/models/transaction-manager.ts";
import { Collection, MongoClient } from "mongodb";
import { Session, Transaction, User } from "../../src/types.ts";
import { assertEquals } from "@std/assert";
import { SessionManager } from "../../src/models/session-manager.ts";
import { UserManager } from "../../src/models/user-manager.ts";

const createTransaction = (userId: number, amount: number): Transaction => {
  return {
    createdAt: new Date(),
    category: "general",
    userId,
    amount,
  };
};

let client: MongoClient;
let transactionCollection: Collection<Transaction>;
let sessionCollection: Collection<Session>;
let userCollection: Collection<User>;

beforeEach(async () => {
  client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const database = client.db("test");

  transactionCollection = database.collection("transactions");
  sessionCollection = database.collection("sessions");
  userCollection = database.collection("users");

  await sessionCollection.deleteMany({});
  await userCollection.deleteMany({});
  await transactionCollection.deleteMany({});
});

afterEach(async () => {
  await transactionCollection.deleteMany({});
  await sessionCollection.deleteMany({});
  await userCollection.deleteMany({});
  await client.close();
});

// deno-lint-ignore require-await
const defaultEncryptPassword = async (password: string) => password;

// deno-lint-ignore require-await
const defaultPasswordVerifier = async (): Promise<boolean> => true;

const idGenerator =
  (start = 0) =>
  () =>
    start++;

describe("serveAllTransactions", () => {
  it("should return 401 if session is invalid", async () => {
    const transactionManager = new TransactionManager(transactionCollection);
    const sessionManager = SessionManager.init(
      () => 0,
      sessionCollection,
      userCollection
    );
    const app = createApp({ transactionManager, sessionManager });

    const response = await app.request("/transactions", {
      headers: { Cookie: `sessionId=9999` },
    });

    assertEquals(response.status, 401);
    assertEquals(await response.json(), { message: "Unauthorized" });
  });

  it("should call getAllTransactions of TransactionManager class", async () => {
    const transactionManager = new TransactionManager(transactionCollection);
    const sessionManager = SessionManager.init(
      () => 0,
      sessionCollection,
      userCollection
    );
    const userManager = new UserManager(
      () => 0,
      defaultEncryptPassword,
      defaultPasswordVerifier,
      userCollection
    );
    const app = createApp({
      transactionManager,
      sessionManager,
    });

    const userId = await userManager.createUser("user-1", "password-1");
    const sessionId = await sessionManager.createSession(userId);
    const transaction1 = createTransaction(userId, 100);

    const transactions: Transaction[][] = [[], [transaction1]];

    const getAllTransactionsSpy = stub(
      transactionManager,
      "getAllTransactions",
      () => Promise.resolve(transactions.shift() || [])
    );

    const zeroTransactionsResponse = await app.request("/transactions", {
      headers: { Cookie: `sessionId=${sessionId}` },
    });

    assertEquals(zeroTransactionsResponse.status, 200);
    assertEquals(await zeroTransactionsResponse.json(), []);

    assertSpyCallArgs(getAllTransactionsSpy, 0, [userId]);

    const oneTransactionResponse = await app.request("/transactions", {
      headers: { Cookie: `sessionId=${sessionId}` },
    });

    assertEquals(oneTransactionResponse.status, 200);

    assertSpyCallArgs(getAllTransactionsSpy, 1, [sessionId]);
    assertEquals(await oneTransactionResponse.json(), [
      { ...transaction1, createdAt: transaction1.createdAt.toISOString() },
    ]);
  });

  it("should return transactions of a specific user", async () => {
    const transactionManager = new TransactionManager(transactionCollection);
    const sessionManager = SessionManager.init(
      idGenerator(0),
      sessionCollection,
      userCollection
    );
    const userManager = new UserManager(
      idGenerator(0),
      defaultEncryptPassword,
      defaultPasswordVerifier,
      userCollection
    );

    const userId1 = await userManager.createUser("user-1", "password-1");
    const userId2 = await userManager.createUser("user-2", "password-2");

    const app = createApp({ transactionManager, sessionManager });

    const transaction1 = createTransaction(userId1, 100);
    const transaction2 = createTransaction(userId2, 200);
    const transaction3 = createTransaction(userId1, 300);

    const transactions: Transaction[][] = [
      [transaction1, transaction3],
      [transaction2],
    ];

    const getAllTransactionsSpy = stub(
      transactionManager,
      "getAllTransactions",
      (userId: number) =>
        userId === userId1
          ? Promise.resolve(transactions[0])
          : Promise.resolve(transactions[1])
    );

    const sessionId1 = await sessionManager.createSession(userId1);

    const user1Response = await app.request("/transactions", {
      headers: { Cookie: `sessionId=${sessionId1}` },
    });

    assertEquals(user1Response.status, 200);
    assertSpyCallArgs(getAllTransactionsSpy, 0, [userId1]);
    assertEquals(await user1Response.json(), [
      { ...transaction1, createdAt: transaction1.createdAt.toISOString() },
      { ...transaction3, createdAt: transaction3.createdAt.toISOString() },
    ]);

    const sessionId2 = await sessionManager.createSession(userId2);

    const user2Response = await app.request("/transactions", {
      headers: { Cookie: `sessionId=${sessionId2}` },
    });

    assertEquals(user2Response.status, 200);
    assertSpyCallArgs(getAllTransactionsSpy, 1, [userId2]);
    assertEquals(await user2Response.json(), [
      { ...transaction2, createdAt: transaction2.createdAt.toISOString() },
    ]);
  });
});
