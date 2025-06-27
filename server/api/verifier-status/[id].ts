import { decodeJwt, decodeProtectedHeader } from "jose";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const transactionId = getRouterParam(event, "id");
  const hostApi =
    process.env.INTERNAL_HOST_API ||
    process.env.HOST_API ||
    config.public.hostApi ||
    "http://eudi-verifier-backend:8080";

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
      const vpToken = Array.isArray(response.vp_token)
        ? response.vp_token[0]
        : response.vp_token;

      console.log("Received VP Token:", vpToken);
      console.log("VP Token type:", typeof vpToken);
      console.log("VP Token length:", vpToken.length);

      let verifiedData = {};

      try {
        const parts = vpToken.split("~");

        if (parts.length >= 2) {
          const issuerJwt = parts[0];
          const issuerClaims = decodeJwt(issuerJwt);

          verifiedData.issuer =
            issuerClaims.iss || "http://wallet-enterprise-issuer:8003";
          verifiedData.vct = issuerClaims.vct || "urn:eudi:pid:1";

          const disclosures = parts.slice(1, -1);

          for (const disclosure of disclosures) {
            if (disclosure) {
              try {
                const decoded = Buffer.from(disclosure, "base64url").toString();
                const disclosureData = JSON.parse(decoded);

                if (
                  Array.isArray(disclosureData) &&
                  disclosureData.length >= 3
                ) {
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

      return {
        status: "completed",
        verifiedCredentials: verifiedData,
        raw: response,
      };
    }

    return { status: "pending" };
  } catch (error) {
    const storage = useStorage("memory");
    const stored = await storage.getItem(`verification:${transactionId}`);

    if (stored) {
      return {
        status: "completed",
        verifiedCredentials: stored,
      };
    }

    return { status: "pending" };
  }
});
