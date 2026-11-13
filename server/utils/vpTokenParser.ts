// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { decodeJwt } from "jose";
import { createLogger } from "./logger";

const logger = createLogger("vpTokenParser");

// Registered and structural JWT / SD-JWT claims, never part of the attested data.
const RESERVED_CLAIMS = new Set([
  "iss", "sub", "aud", "exp", "nbf", "iat", "jti", "vct", "vct#integrity",
  "cnf", "status", "_sd", "_sd_alg",
]);

export function parseVpToken(
  rawVpToken: any,
  options: { includePlainClaims?: boolean } = {},
): Record<string, any> {
  const vpTokens = extractToken(rawVpToken);

  if (!vpTokens.length) {
    throw new Error("No VP Tokens found");
  }

  const mergedData: Record<string, any> = {
    issuer: "",
    vct: "",
  };

  for (const vpToken of vpTokens) {
    try {
      const parts = vpToken.split("~");
      if (parts.length < 2) {
        throw new Error("Invalid VP Token");
      }
      if(parts[0]){
        const decodedJwt = decodeJwt(parts[0]);
        mergedData.issuer = decodedJwt.iss || mergedData.issuer;
        mergedData.vct = decodedJwt.vct || mergedData.vct;

        // Claims that are not selectively disclosable sit in the issuer JWT itself.
        if (options.includePlainClaims) {
          for (const [name, value] of Object.entries(decodedJwt)) {
            if (!RESERVED_CLAIMS.has(name)) mergedData[name] = value;
          }
        }

        for (const disclosure of parts.slice(1, -1)) {
          if (!disclosure) continue;
          try {
            const decoded = JSON.parse(
              Buffer.from(disclosure, "base64url").toString(),
            );
            if (Array.isArray(decoded) && decoded.length >= 3) {
              mergedData[decoded[1]] = decoded[2];
            }
          } catch (e) {
            logger.error("Failed to parse disclosure", {
              "exception.message": e instanceof Error ? e.message : String(e),
            });
          }
        }
      }
    } catch (parseError) {
      logger.error("Error parsing SD-JWT", {
        "exception.message": parseError instanceof Error ? parseError.message : String(parseError),
      });
      throw new Error("Invalid VP Token");
    }
  }

  if (!mergedData.issuer || !mergedData.vct) {
    throw new Error("Invalid VP Token: Missing issuer or vct");
  }

  logger.info("Parsed VP Token fields", { mergedData });
  return mergedData;
}

/**
 * Parses a DCQL vp_token keeping each requested credential apart, keyed by its
 * DCQL credential query id. Use when the request asks for several credentials
 * whose claims must not be merged, e.g. a PID together with an attestation.
 */
export function parseVpTokenByQueryId(
  rawVpToken: any,
): Record<string, Record<string, any>> {
  if (!rawVpToken || typeof rawVpToken !== "object" || Array.isArray(rawVpToken)) {
    throw new Error("Invalid VP Token: expected an object keyed by credential query id");
  }
  const result: Record<string, Record<string, any>> = {};
  for (const [queryId, value] of Object.entries(rawVpToken)) {
    result[queryId] = parseVpToken(value, { includePlainClaims: true });
  }
  return result;
}

function extractToken(token: any): string[] {
  if (typeof token === "string") return [token];
  if (Array.isArray(token)) {
    const tokens: string[] = [];
    for (const item of token) {
      tokens.push(...extractToken(item));
    }
    return tokens;
  }
  if (token && typeof token === "object") {
    const tokens: string[] = [];
    for (const key of Object.keys(token)){
      const extracted = extractToken(token[key]);
      if (extracted) tokens.push(...extracted);
    }
    return tokens;
  }
  return [];
}
