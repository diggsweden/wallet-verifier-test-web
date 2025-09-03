import { parseVpToken } from "~/server/utils/vpTokenParser";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const transactionId = getRouterParam(event, "id");
  const hostApi =
    process.env.INTERNAL_HOST_API ||
    process.env.HOST_API ||
    config.public.hostApi ||
    "http://eudi-verifier-backend:8080";

  try {
    const response = await $fetch(
      `${hostApi}/ui/presentations/${transactionId}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        ignoreHTTPSErrors: true,
      },
    );

    if (response && response.vp_token) {
      console.log("Received VP Token:", response.vp_token);

      const verifiedData = parseVpToken(response.vp_token);

      return {
        status: "completed",
        verifiedCredentials: verifiedData,
        raw: response,
      };
    }

    return { status: "pending" };
  } catch (error) {
    const storage = useStorage("memory");
    const stored = await storage.getItem(`verification:${transactionId}`);

    if (stored) {
      return {
        status: "completed",
        verifiedCredentials: stored,
      };
    }

    return { status: "pending" };
  }
});
