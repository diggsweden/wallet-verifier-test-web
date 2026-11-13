// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { randomUUID } from "crypto";
import { createLogger } from "~/server/utils/logger";
import { serviceConfigs } from "~~/shared/utils/serviceConfig";

const { response_mode } = serviceConfigs.jobbcentralen;

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
  const presentationUrl = `${hostApi}/ui/presentations`;

  const logger = createLogger("jobbcentralen-request");

  try {
    const verifyId = randomUUID();
    const requestBody = {
      type: "vp_token",
      dcql_query: {
        credentials: [
          {
            id: "pid",
            format: "dc+sd-jwt",
            meta: {
              vct_values: ["urn:eudi:pid:1"],
            },
            claims: [
              {
                path: ["family_name"],
              },
              {
                path: ["given_name"],
              },
            ],
          },
          {
            id: "learning",
            format: "dc+sd-jwt",
            meta: {
              vct_values: ["urn:eu.europa.ec.eudi:learning:credential:1"],
            },
            claims: [
              {
                path: ["family_name"],
              },
              {
                path: ["given_name"],
              },
              {
                path: ["achievement_title"],
              },
              {
                path: ["assessment_grade"],
              },
            ],
          },
        ],
      },
      nonce: randomUUID(),
      request_uri_method: "get",
      response_mode,
      intended_use_id: "1",
    };

    if (flow_type === "same_device") {
      requestBody.wallet_response_redirect_uri_template = `${publicBaseUrl}/api/verifier-status/jobbcentralen/${verifyId}?response_code={RESPONSE_CODE}`;
    }

    logger.info("Sending presentation request to verifier backend",  {
      verifyId,
      flowType: flow_type,
      "url.full": presentationUrl,
    });
    logger.debug("Request body", requestBody);

    const response = await $fetch(presentationUrl, {
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
    const responseStatus =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "status" in error.response &&
      typeof error.response.status === "number"
        ? error.response.status
        : undefined;

    logger.error("Verifier request failed", {
      "exception.message": error instanceof Error ? error.message : String(error),
      "http.response.status_code": responseStatus,
      "url.full": presentationUrl,
      "response.body": error.data ? JSON.stringify(error.data) : "No data",
    });
    throw createError({
      statusCode: responseStatus,
      statusMessage: "Failed to create verification request",
    });
  }
});
