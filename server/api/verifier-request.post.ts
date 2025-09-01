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
      dcql_query: {
        credentials: [
          {
            id: "pid_credential",
            format: "dc+sd-jwt",
            meta: { vct: "urn:eudi:pid:1" },
          },
        ],
        credential_sets: [
          {
            options: [["pid_credential"]],
            purpose: "Verify your identity for access to Mina Sidor",
          },
        ],
      },
      response_mode: "direct_post",
      response_uri: `${publicBaseUrl}/api/verifier-callback`,
      state: randomUUID(),
      nonce: clientBody.nonce || randomUUID(),
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
