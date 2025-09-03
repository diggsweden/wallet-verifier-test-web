import { decodeJwt } from "jose";

export interface VerifiedCredentials {
  given_name?: string;
  family_name?: string;
  last_name?: string;
  personal_administrative_number?: string;
  issuer?: string;
  vct?: string;
  issuance_date?: string;
  issuing_country?: string;
  issuing_authority?: string;
  expiry_date?: string;
  birth_date?: string;
  birthdate?: string;
  age_over_15?: boolean;
  age_over_16?: boolean;
  age_over_18?: boolean;
  age_over_20?: boolean;
  age_over_65?: boolean;
  age_in_years?: number;
  [key: string]: any;
}

export function parseVpToken(rawVpToken: any): VerifiedCredentials {
  let vpToken = rawVpToken;

  // Handle array format
  if (Array.isArray(vpToken)) {
    vpToken = vpToken[0];
  }

  // Handle the new JWT response format where vp_token is an object
  if (typeof vpToken === 'object' && vpToken !== null && typeof vpToken !== 'string') {
    // Extract the actual token from the first query key (e.g., query_0)
    const firstKey = Object.keys(vpToken)[0];
    if (firstKey && Array.isArray(vpToken[firstKey]) && vpToken[firstKey].length > 0) {
      vpToken = vpToken[firstKey][0];
    }
  }

  console.log("Processing VP Token:", typeof vpToken);
  console.log("VP Token length:", vpToken?.length);

  let verifiedData: VerifiedCredentials = {};

  try {
    if (typeof vpToken !== 'string') {
      throw new Error('VP Token is not a string after processing');
    }

    const parts = vpToken.split("~");

    if (parts.length >= 2) {
      const issuerJwt = parts[0];
      const issuerClaims = decodeJwt(issuerJwt);

      verifiedData.issuer = issuerClaims.iss || "http://wallet-enterprise-issuer:8003";
      verifiedData.vct = issuerClaims.vct || "urn:eudi:pid:1";

      const disclosures = parts.slice(1, -1);

      for (const disclosure of disclosures) {
        if (disclosure) {
          try {
            const decoded = Buffer.from(disclosure, "base64url").toString();
            const disclosureData = JSON.parse(decoded);

            if (Array.isArray(disclosureData) && disclosureData.length >= 3) {
              const [salt, claimName, claimValue] = disclosureData;
              verifiedData[claimName] = claimValue;
            }
          } catch (e) {
            console.error("Failed to parse disclosure:", e);
          }
        }
      }

      if (!verifiedData.given_name) {
        verifiedData.given_name = "Error";
        verifiedData.family_name = "Errorsson";
        verifiedData.personal_administrative_number = "257654325";
      }
    }

    console.log("Parsed VP Token fields:", JSON.stringify(verifiedData, null, 2));
  } catch (parseError) {
    console.error("Error parsing SD-JWT:", parseError);
    verifiedData = {
      given_name: "Error",
      family_name: "Errorsson",
      personal_administrative_number: "257654325",
      issuer: "http://wallet-enterprise-issuer:8003",
      vct: "urn:eudi:pid:1",
    };
  }

  return verifiedData;
}