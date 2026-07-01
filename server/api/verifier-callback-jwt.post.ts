// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { parseVpToken } from "~/server/utils/vpTokenParser";
import { createLogger } from "~/server/utils/logger";

const logger = createLogger("verifier-callback-jwt");

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  logger.info("Got a direct_post.jwt callback");
  logger.debug("Callback body", body);

  if (body.vp_token) {
    try {
      const verifiedData = parseVpToken(body.vp_token);
      logger.info("Parsed VP Token data", { verifiedData });

      const storage = useStorage("memory");
      const state = body.state || "latest";
      await storage.setItem(`verification:${state}`, verifiedData);
    } catch (error) {
      logger.error("Error parsing VP token in callback", {
        "exception.message": error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { success: true };
});
