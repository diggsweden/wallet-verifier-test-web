// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { createLogger } from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
  const logger = createLogger("verifier-status");
  const config = useRuntimeConfig();
  const hostApi =
    process.env.INTERNAL_HOST_API ||
    process.env.HOST_API ||
    config.public.hostApi ||
    "http://eudi-verifier-backend:8080";

  try {
    logger.info("Checking verifier backend status", { "url.full": hostApi });
    const response = await $fetch(`${hostApi}/public/openapi.json`, {
      ignoreHTTPSErrors: true,
    });

    logger.debug("Verifier backend is online");
    return {
      status: "online",
      metadata: response,
    };
  } catch (error) {
    logger.error("Failed to fetch verifier status", {
      "exception.message": error instanceof Error ? error.message : String(error),
      "url.full": hostApi,
    });
    return {
      status: "offline",
      metadata: { error: "Failed to fetch from verifier-backend!" },
    };
  }
});
