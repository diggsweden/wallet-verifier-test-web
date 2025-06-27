export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const hostApi =
    process.env.INTERNAL_HOST_API ||
    process.env.HOST_API ||
    config.public.hostApi ||
    "http://eudi-verifier-backend:8080";

  try {
    const response = await $fetch(`${hostApi}/ui/clientMetadata`, {
      ignoreHTTPSErrors: true,
    });

    return {
      status: "online",
      metadata: response,
    };
  } catch (error) {
    console.error("Failed to fetch verifier status:", error);
    return {
      status: "offline",
      metadata: { error: "Failed to fetch from verifier-backend!" },
    };
  }
});
