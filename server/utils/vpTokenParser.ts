import { decodeJwt } from "jose";

const DEFAULT_DATA = {
  given_name: "Error",
  family_name: "Errorsson",
  personal_administrative_number: "257654325",
  issuer: "http://wallet-enterprise-issuer:8003",
  vct: "urn:eudi:pid:1",
};

export function parseVpToken(rawVpToken: any): Record<string, any> {
  // Extract string token from various formats
  let vpToken = extractToken(rawVpToken);

  console.log("Processing VP Token:", typeof vpToken, vpToken?.length);

  if (typeof vpToken !== "string") {
    console.error("VP Token is not a string after processing");
    return DEFAULT_DATA;
  }

  try {
    const parts = vpToken.split("~");
    if (parts.length < 2) return DEFAULT_DATA;

    const verifiedData: Record<string, any> = {
      issuer: decodeJwt(parts[0]).iss || DEFAULT_DATA.issuer,
      vct: decodeJwt(parts[0]).vct || DEFAULT_DATA.vct,
    };

    // Parse disclosures
    for (const disclosure of parts.slice(1, -1)) {
      if (!disclosure) continue;

      try {
        const decoded = JSON.parse(
          Buffer.from(disclosure, "base64url").toString(),
        );
        if (Array.isArray(decoded) && decoded.length >= 3) {
          verifiedData[decoded[1]] = decoded[2]; // [salt, claimName, claimValue]
        }
      } catch (e) {
        console.error("Failed to parse disclosure:", e);
      }
    }

    // Fallback if no name found
    if (!verifiedData.given_name) {
      Object.assign(verifiedData, DEFAULT_DATA);
    }

    console.log(
      "Parsed VP Token fields:",
      JSON.stringify(verifiedData, null, 2),
    );
    return verifiedData;
  } catch (parseError) {
    console.error("Error parsing SD-JWT:", parseError);
    return DEFAULT_DATA;
  }
}

function extractToken(token: any): string | null {
  if (typeof token === "string") return token;
  if (Array.isArray(token)) return extractToken(token[0]);
  if (token && typeof token === "object") {
    const firstKey = Object.keys(token)[0];
    return firstKey ? extractToken(token[firstKey]) : null;
  }
  return null;
}
