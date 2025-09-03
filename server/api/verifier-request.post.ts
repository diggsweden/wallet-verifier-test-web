import { randomUUID } from "crypto";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const hostApi =
    process.env.INTERNAL_HOST_API ||
    process.env.HOST_API ||
    config.public.hostApi ||
    "http://eudi-verifier-backend:8080";
  const publicBaseUrl =
    process.env.PUBLIC_BASE_URL ||
    process.env.NUXT_PUBLIC_BASE_URL ||
    "https://custom-verifier";
  const clientBody = await readBody(event);

  try {
    const requestBody = {
      type: "vp_token",
      dcql_query: {
        credentials: [
          {
            id: "query_0",
            format: "dc+sd-jwt",
            meta: {
              vct_values: ["urn:eudi:pid:1"],
            },
          },
        ],
      },
      nonce: randomUUID(),
      request_uri_method: "get",
      response_uri: `${publicBaseUrl}/api/verifier-callback-jwt`,
    };

    console.log(
      "Sending request to EUDI backend:",
      JSON.stringify(requestBody, null, 2),
    );

    const response = await $fetch(`${hostApi}/ui/presentations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
      ignoreHTTPSErrors: true,
    });

    return response;
  } catch (error) {
    console.error("Verifier request error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create verification request",
    });
  }
});
