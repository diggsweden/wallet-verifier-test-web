// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { randomUUID } from "node:crypto";
import { createLogger } from "~/server/utils/logger";
import { serviceConfigs } from "~~/shared/utils/serviceConfig";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const hostApi =
    process.env.INTERNAL_HOST_API ||
    process.env.HOST_API ||
    config.public.hostApi ||
    "http://eudi-verifier-backend:8080";
  const presentationUrl = `${hostApi}/ui/presentations`;
  const logger = createLogger("testcentralen-request");

  try {
    return await $fetch(presentationUrl, {
      method: "POST",
      body: {
        dcql_query: {
          credentials: [
            {
              id: "birthdate_credential",
              format: "dc+sd-jwt",
              meta: { vct_values: ["urn:eudi:pid:1"] },
              claims: [{ path: ["birthdate"] }],
            },
          ],
        },
        nonce: randomUUID(),
        jar_mode: "by_reference",
        request_uri_method: "get",
        ...serviceConfigs.testcentralen,
      },
    });
  } catch (error) {
    logger.error("Failed to create negative test request", {
      "exception.message": error instanceof Error ? error.message : String(error),
      "url.full": presentationUrl,
    });
    throw createError({
      statusCode: 502,
      statusMessage: "Failed to create negative test request",
    });
  }
});
