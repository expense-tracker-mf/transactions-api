import { Hono } from "hono";

const createApp = (): Hono => {
  const app = new Hono();

  app.get("/", (c) => c.text("Server is running!"));

  return app;
};

export default createApp;
