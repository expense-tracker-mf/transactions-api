import createApp from "./src/app.ts";

const main = () => {
  Deno.serve(createApp().fetch);
};

main();
