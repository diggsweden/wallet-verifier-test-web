export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  //const storage = useStorage("memory");
  //const state = body.state || "latest";
  //await storage.setItem(`verification:${state}`, body);

  console.log("Got a direct_post.jwt callback!");

  return { success: true };
});
