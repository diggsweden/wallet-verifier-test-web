// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { parseVpToken } from "#server/utils/vpTokenParser";
import { createLogger } from "~/server/utils/logger";

const logger = createLogger("verifier-status");

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  let siteName = getRouterParam(event, "site")
  let transactionId = getRouterParam(event, "id");
  const query = getQuery(event);
  const responseCode = query.response_code;
  const hostApi =
    process.env.INTERNAL_HOST_API ||
    process.env.HOST_API ||
    config.public.hostApi ||
    "http://eudi-verifier-backend:8080";
  const baseUrl =
    process.env.PUBLIC_BASE_URL || process.env.NUXT_PUBLIC_BASE_URL || "";

  if (responseCode) {

    const storage = useStorage("memory");
    const transactionData = await storage.getItem(`verify:${transactionId}`);

    if (!transactionData || !siteName) {
      return sendRedirect(
        event,
        `${baseUrl}/${siteName}?error=Invalid%20verification%20link`,
        302,
      );
    }

    transactionId = transactionData.transactionId;

    try {
      const response = await $fetch(
        `${hostApi}/ui/presentations/${transactionId}?response_code=${responseCode}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          ignoreHTTPSErrors: true,
        },
      );

      if (response && response.vp_token) {
        const verifiedData = parseVpToken(response.vp_token);
        const data = encodeURIComponent(JSON.stringify(verifiedData));
        return sendRedirect(
          event,
          `${baseUrl}/${siteName}?success=true&data=${data}`,
          302,
        );
      }

      return sendRedirect(
        event,
        `${baseUrl}/${siteName}?error=Verification%20pending`,
        302,
      );
    } catch (error) {
      return sendRedirect(
        event,
        `${baseUrl}/${siteName}?error=Verification%20failed`,
        302,
      );
    }
  }

  try {
    const response = await $fetch(
      `${hostApi}/ui/presentations/${transactionId}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        ignoreHTTPSErrors: true,
      },
    );

    if (response && response.vp_token) {
      logger.info("Received VP Token", { transactionId, hasToken: true });

      const verifiedData = parseVpToken(response.vp_token);

      return {
        status: "completed",
        verifiedCredentials: verifiedData,
        raw: response,
      };
    }

    logger.debug("No VP token yet, status pending", { transactionId });
    return { status: "pending" };
  } catch (error) {
    const storage = useStorage("memory");
    const stored = await storage.getItem(`verification:${transactionId}`);

    if (stored) {
      logger.info("Returning stored verification data", { transactionId });
      return {
        status: "completed",
        verifiedCredentials: stored,
      };
    }

    logger.debug("Verification still pending", { transactionId });
    return { status: "pending" };
  }
});
