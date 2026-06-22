// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { randomUUID } from "crypto";
import { createLogger } from "~/server/utils/logger";

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

  const logger = createLogger("biocentralen-request");

  try {
    const verifyId = randomUUID();
    const requestBody = {
      type: "vp_token",
      dcql_query: {
        credentials: [
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
          {
            id: "family_name_credential",
            format: "dc+sd-jwt",
            meta: {
              vct_values: ["urn:eudi:pid:1"],
            },
            claims: [
              {
                path: ["family_name"],
              },
            ],
          }
        ],
        credential_sets: [
          {
            options: [["birthdate_credential"]],
            required: true,
          },
          {
            options: [["family_name_credential"]],
            required: false,
          },
        ],
      },
      nonce: randomUUID(),
      request_uri_method: "get",
    };

    if (flow_type === "same_device") {
      requestBody.wallet_response_redirect_uri_template = `${publicBaseUrl}/api/verifier-status/biocentralen/${verifyId}?response_code={RESPONSE_CODE}`;
    }

    logger.info("Sending request to EUDI backend", {
      verifyId,
      flowType: flow_type,
      "url.full": `${hostApi}/ui/presentations`,
    });
    logger.debug("Request body", requestBody);

    const response = await $fetch(`${hostApi}/ui/presentations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
      ignoreHTTPSErrors: true,
    });

    logger.info("Request successful", { verifyId, transactionId: response.transaction_id });

    const storage = useStorage("memory");
    await storage.setItem(`verify:${verifyId}`, {
      transactionId: response.transaction_id,
    });

    return response;
  } catch (error) {
    logger.error("Verifier request failed", {
      "exception.message": error instanceof Error ? error.message : String(error),
      "url.full": hostApi,
    });
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create verification request",
    });
  }
});
