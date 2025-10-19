import { Collection, MongoClient } from "mongodb";
import createApp from "./src/app.ts";
import { AppContext, Session, Transaction, User } from "./src/types.ts";
import { SessionManager } from "./src/models/session-manager.ts";
import TransactionManager from "./src/models/transaction-manager.ts";
import "https://deno.land/x/dotenv/load.ts";

const connectToMongoDB = async (uri: string, dbName: string) => {
  if (!uri) throw new Error("MONGO_URI environment variable is not set");

  const client = new MongoClient(uri);
  try {
    await client.connect();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }

  console.log("Connected to MongoDB");
  return client.db(dbName);
};

const idGenerator = (): number =>
  Date.now() * 10000 + Math.floor(performance.now() * 10000);

const main = async () => {
  const database = await connectToMongoDB(
    Deno.env.get("MONGO_URI")!,
    "expense-tracker"
  );

  const transactionCollection: Collection<Transaction> =
    database.collection("transactions");
  const sessionCollection: Collection<Session> =
    database.collection("sessions");
  const userCollection: Collection<User> = database.collection("users");

  const appContext: AppContext = {
    transactionManager: new TransactionManager(transactionCollection),
    sessionManager: SessionManager.init(
      idGenerator,
      sessionCollection,
      userCollection
    ),
  };

  Deno.serve(createApp(appContext).fetch);
};

main();
