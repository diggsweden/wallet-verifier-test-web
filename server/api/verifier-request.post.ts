import { randomUUID } from "crypto";

async function decodeQRCode(buffer: Buffer): Promise<string> {
  const { Jimp } = await import("jimp");
  const QrCodeReader = (await import("qrcode-reader")).default;

  return new Promise((resolve, reject) => {
    Jimp.read(buffer)
      .then((image: any) => {
        const qr = new QrCodeReader();
        qr.callback = (err: Error | null, value: any) => {
          if (err) reject(err);
          else resolve(value.result);
        };
        qr.decode(image.bitmap);
      })
      .catch(reject);
  });
}

const DCQL_QUERY = {
  credentials: [
    {
      id: "pid_credential",
      format: "dc+sd-jwt",
      meta: { doctype_value: "eu.europa.ec.eudi.pid.1" },
      claims: [
        {
          path: [
            "eu.europa.ec.eudi.pid.1",
            "given_name",
            "eu.europa.ec.eudi.pid.1",
            "family_name",
            "eu.europa.ec.eudi.pid.1",
            "personal_administrative_number",
          ],
        },
      ],
    },
  ],
  credential_sets: [
    {
      options: [["pid_credential"]],
      purpose: "Verify your identity for access to Mina Sidor",
    },
  ],
};

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const hostApi =
    process.env.INTERNAL_HOST_API ||
    process.env.HOST_API ||
    config.public.hostApi ||
    "http://eudi-verifier-backend:8080";
  const publicBaseUrl =
    process.env.PUBLIC_BASE_URL ||
    process.env.NUXT_PUBLIC_BASE_URL ||
    "https://custom-verifier";

  try {
    const requestBody = {
      type: "vp_token",
      dcql_query: DCQL_QUERY,
      nonce: randomUUID(),
      response_mode: "direct_post",
      response_uri: `${publicBaseUrl}/api/verifier-callback`,
      state: randomUUID(),
    };

    const [jsonResponse, qrResponse] = await Promise.all([
      $fetch(`${hostApi}/ui/presentations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: requestBody,
        ignoreHTTPSErrors: true,
      }) as Promise<any>,
      $fetch.raw(`${hostApi}/ui/presentations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "image/png" },
        body: requestBody,
        ignoreHTTPSErrors: true,
        responseType: "arrayBuffer",
      }),
    ]);

    if (!qrResponse._data) {
      throw new Error("No QR code data received from backend");
    }

    const buffer = Buffer.from(qrResponse._data as ArrayBuffer);
    const qrData = await decodeQRCode(buffer);

    let clientId = jsonResponse.client_id || "wallet-verifier-test-web";
    let requestUri = jsonResponse.request_uri;
    const qrCodeUrl = qrData;

    if (qrData.includes("?")) {
      const queryString = qrData.split("?")[1];
      const params = new URLSearchParams(queryString);
      clientId = params.get("client_id") || clientId;
      requestUri = params.get("request_uri");
    }

    const webWalletUrl = config.public.webWalletUrl;
    const authUrl = webWalletUrl
      ? `${webWalletUrl}?client_id=${encodeURIComponent(clientId)}&request_uri=${encodeURIComponent(jsonResponse.request_uri)}`
      : qrCodeUrl;

    const base64Image = buffer.toString("base64");

    return {
      qrCodeDataUrl: `data:image/png;base64,${base64Image}`,
      transaction_id: jsonResponse.transaction_id,
      authUrl,
      client_id: clientId,
      request_uri: requestUri,
      state: requestBody.state,
    };
  } catch (error) {
    console.error("Verifier request error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create verification request",
    });
  }
});
