import { parseVpToken } from "~/server/utils/vpTokenParser";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  console.log("Got a direct_post.jwt callback!:");
  console.dir(body);

  if (body.vp_token) {
    try {
      const verifiedData = parseVpToken(body.vp_token);
      console.log("Parsed VP Token data:", verifiedData);

      const storage = useStorage("memory");
      const state = body.state || "latest";
      await storage.setItem(`verification:${state}`, verifiedData);
    } catch (error) {
      console.error("Error parsing VP token in callback:", error);
    }
  }

  return { success: true };
});
