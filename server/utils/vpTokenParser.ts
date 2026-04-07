// SPDX-FileCopyrightText: 2026 The Wallet Test Verifier Web Authors
//
// SPDX-License-Identifier: EUPL-1.2

import { decodeJwt } from "jose";

export function parseVpToken(rawVpToken: any): Record<string, any> {
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
            console.error("Failed to parse disclosure:", e);
          }
        }
      }
    } catch (parseError) {
      console.error("Error parsing SD-JWT:", parseError);
      throw new Error("Invalid VP Token");
    }
  }

  if (!mergedData.issuer || !mergedData.vct) {
    throw new Error("Invalid VP Token: Missing issuer or vct");
  }

  console.log(
    "Parsed VP Token fields:",
    JSON.stringify(mergedData, null, 2),
  );
  return mergedData;
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
