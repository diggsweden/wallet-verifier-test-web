// SPDX-FileCopyrightText: 2025 The Wallet Test Verifier Web Authors
//
// SPDX-License-Identifier: EUPL-1.2

import { decodeJwt } from "jose";

const DEFAULT_DATA = {
  given_name: "Error",
  family_name: "Errorsson",
  personal_administrative_number: "257654325",
  issuer: "http://wallet-enterprise-issuer:8003",
  vct: "urn:eudi:pid:1",
};

export function parseVpToken(rawVpToken: any): Record<string, any> {
  const vpTokens = extractToken(rawVpToken);

  console.log("Processing VP Token:", typeof vpTokens, vpTokens?.length);

  if (!vpTokens.length) {
    console.error("No vp token found");
    return DEFAULT_DATA;
  }
  const mergedData: Record<string, any> = {
    issuer: DEFAULT_DATA.issuer,
    vct: DEFAULT_DATA.vct,
  };
  for (const vpToken of vpTokens) {
    try {
      const parts = vpToken.split("~");
      if (parts.length < 2) continue;
      if (!mergedData.issuer && parts[0]) {
        mergedData.issuer = decodeJwt(parts[0]).iss || DEFAULT_DATA.issuer;
        mergedData.vct = decodeJwt(parts[0]).vct || DEFAULT_DATA.vct;
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
          console.error("Failed to parse disclosure:", e);
        }
      }
    } catch (parseError) {
      console.error("Error parsing SD-JWT:", parseError);
      return DEFAULT_DATA;
    }
  }
  console.log(
    "Parsed VP Token fields:",
    JSON.stringify(mergedData, null, 2),
  );
  return mergedData;
}

function extractToken(token: any): string[] {
  if (typeof token === "string") return [token];
  if (Array.isArray(token)) return extractToken(token[0]);
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
