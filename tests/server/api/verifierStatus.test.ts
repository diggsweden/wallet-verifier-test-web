// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { beforeEach, describe, expect, it, vi } from "vitest";

describe("verifier-status API endpoint", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.spyOn(console, "log").mockImplementation(() => {});

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
      walletUrl: "openid4vp://",
      baseUrl: "https://localhost/refimpl-verifier-backend",
    });
  });

  it("returns unknown backendVersion and runtime environment values when backend is offline", async () => {
    process.env.WALLET_URL = "eudi-openid4vp://";
    process.env.PUBLIC_BASE_URL = "https://verifier.example.se";

    vi.stubGlobal("$fetch", vi.fn().mockRejectedValue(new Error("Connection refused")));

    const { default: handler } = await import("~/server/api/verifier-status");
    const result = await handler({} as never);

    expect(result.status).toBe("offline");
    expect(result.config).toEqual({
      backendVersion: "okänd",
      walletUrl: "eudi-openid4vp://",
      baseUrl: "https://verifier.example.se",
    });
  });
});
