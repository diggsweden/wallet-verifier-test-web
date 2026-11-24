// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { beforeEach, describe, expect, it, vi } from "vitest";

describe("verifier-status API endpoint", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.spyOn(console, "log").mockImplementation(() => {});

    delete process.env.VERIFIER_BACKEND_VERSION;
    delete process.env.VERIFIER_CLIENTIDPREFIX;
    delete process.env.VERIFIER_JAR_SIGNING_ALGORITHM;
    delete process.env.VERIFIER_VALIDATION_SDJWTVC_STATUSCHECK_ENABLED;
    delete process.env.WALLET_URL;
    delete process.env.PUBLIC_BASE_URL;

    vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: {
        hostApi: "https://localhost/refimpl-verifier-backend",
        walletUrl: "openid4vp://",
      },
    }));
  });

  it("returns online status, openapi metadata, and derived backend config", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn().mockResolvedValue({ info: { version: "0.12.0" } }),
    );

    const { default: handler } = await import("~/server/api/verifier-status");
    const result = await handler({} as never);

    expect(result.status).toBe("online");
    expect(result.config).toEqual({
      backendVersion: "0.12.0",
      clientIdScheme: "x509_san_dns",
      jarSigningAlgorithm: "ES256",
      statusCheckEnabled: "false",
      walletUrl: "openid4vp://",
      baseUrl: "https://localhost/refimpl-verifier-backend",
    });
  });

  it("returns environment overrides in config even when backend is offline", async () => {
    process.env.VERIFIER_BACKEND_VERSION = "v0.8.0";
    process.env.VERIFIER_CLIENTIDPREFIX = "x509_san_dns";
    process.env.VERIFIER_JAR_SIGNING_ALGORITHM = "ES256";
    process.env.VERIFIER_VALIDATION_SDJWTVC_STATUSCHECK_ENABLED = "true";
    process.env.WALLET_URL = "eudi-openid4vp://";
    process.env.PUBLIC_BASE_URL = "https://verifier.example.se";

    vi.stubGlobal("$fetch", vi.fn().mockRejectedValue(new Error("Connection refused")));

    const { default: handler } = await import("~/server/api/verifier-status");
    const result = await handler({} as never);

    expect(result.status).toBe("offline");
    expect(result.config).toEqual({
      backendVersion: "v0.8.0",
      clientIdScheme: "x509_san_dns",
      jarSigningAlgorithm: "ES256",
      statusCheckEnabled: "true",
      walletUrl: "eudi-openid4vp://",
      baseUrl: "https://verifier.example.se",
    });
  });
});
