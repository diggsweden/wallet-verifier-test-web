// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

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
  const { flow_type } = await readBody(event);

  try {
    const verifyId = randomUUID();
    const requestBody = {
      type: "vp_token",
      dcql_query: {
        credentials: [
          {
            id: "address_credential",
            format: "dc+sd-jwt",
            meta: {
              vct_values: ["urn:eudi:pid:1"],
            },
            claims: [
              {
                path: ["address", "street_address"],
              },
              {
                path: ["address", "postal_code"],
              },
              {
                path: ["address", "locality"],
              },
              {
                path: ["address", "country"],
              },
            ],
          },
          {
            id: "birthdate_credential",
            format: "dc+sd-jwt",
            meta: {
              vct_values: ["urn:eudi:pid:1"],
            },
            claims: [
              {
                path: ["birthdate"],
              },
            ],
          },
        ],
        credential_sets: [
          {
            options: [["address_credential"]],
            required: true,
          },
          {
            options: [["birthdate_credential"]],
            required: false,
          },
        ],
      },
      nonce: randomUUID(),
      request_uri_method: "get",
    };

    if (flow_type === "same_device") {
      requestBody.wallet_response_redirect_uri_template = `${publicBaseUrl}/api/verifier-status/matcentralen/${verifyId}?response_code={RESPONSE_CODE}`;
    }

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

    const storage = useStorage("memory");
    await storage.setItem(`verify:${verifyId}`, {
      transactionId: response.transaction_id,
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
