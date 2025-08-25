import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import createApp from "../src/app.ts";

describe("App", () => {
  it("should Respond with server is running", async () => {
    const app = createApp();

    const response = await app.request("/");

    assertEquals(response.status, 200);
    const text = await response.text();
    assertEquals(text, "Server is running!");
  });
});
