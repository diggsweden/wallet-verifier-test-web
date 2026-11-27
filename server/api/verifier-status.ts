// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { createLogger } from "~/server/utils/logger";
import type { BackendEnvConfig } from "~~/shared/utils/serviceConfig";

function buildBackendConfig(
  runtimeConfig: ReturnType<typeof useRuntimeConfig>,
  openApiVersion?: string,
): BackendEnvConfig {
  const walletUrl = runtimeConfig?.public?.walletUrl || "openid4vp://";
  const baseUrl =
    process.env.PUBLIC_BASE_URL ||
    process.env.NUXT_PUBLIC_BASE_URL ||
    runtimeConfig?.public?.hostApi ||
    "http://localhost:3002";

  return {
    backendVersion: openApiVersion || "okänd",
    walletUrl: String(walletUrl),
    baseUrl: String(baseUrl),
  };
}

export default defineEventHandler(async () => {
  const logger = createLogger("verifier-status");
  const config = useRuntimeConfig();
  const hostApi =
    process.env.INTERNAL_HOST_API ||
    process.env.HOST_API ||
    config.public.hostApi ||
    "http://eudi-verifier-backend:8080";

  try {
    logger.info("Checking verifier backend status", { "url.full": hostApi });
    const response = await $fetch<{ info?: { version?: string } }>(
      `${hostApi}/public/openapi.json`,
      {
        ignoreHTTPSErrors: true,
      },
    );

    logger.debug("Verifier backend is online");
    return {
      status: "online",
      metadata: response,
      config: buildBackendConfig(config, response?.info?.version),
    };
  } catch (error) {
    logger.error("Failed to fetch verifier status", {
      "exception.message":
        error instanceof Error ? error.message : String(error),
      "url.full": hostApi,
    });
    return {
      status: "offline",
      metadata: { error: "Failed to fetch from verifier-backend!" },
      config: buildBackendConfig(config),
    };
  }
});
