// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("~/server/utils/logger", () => ({
  createLogger: () => ({ error: vi.fn() }),
}));

describe("Testcentralen request", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    vi.stubEnv("INTERNAL_HOST_API", "https://backend.example/refimpl-verifier-backend");
    vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);
    vi.stubGlobal("useRuntimeConfig", () => ({ public: {} }));
    vi.stubGlobal("$fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("selects the expired registration certificate for a PID birthdate request", async () => {
    const response = {
      client_id: "x509_san_dns:example.com",
      request_uri: "https://backend.example/request.jwt/1",
    };
    fetchMock.mockResolvedValue(response);
    const { default: handler } = await import("~/server/api/testcentralen-request.post");

    const result = await handler({} as never);

    expect(result).toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example/refimpl-verifier-backend/ui/presentations",
      expect.objectContaining({
        method: "POST",
        body: expect.objectContaining({
          intended_use_id: "expired-registration",
        }),
      }),
    );
    const credentials = fetchMock.mock.calls[0]![1].body.dcql_query.credentials;
    expect(credentials).toHaveLength(1);
    expect(credentials[0].meta.vct_values).toEqual(["urn:eudi:pid:1"]);
    expect(credentials[0].claims).toEqual([{ path: ["birthdate"] }]);
  });

  it("reports a backend failure instead of creating a request with a valid certificate", async () => {
    fetchMock.mockRejectedValue(new Error("UnknownIntendedUseId"));
    const { default: handler } = await import("~/server/api/testcentralen-request.post");

    await expect(handler({} as never)).rejects.toMatchObject({ statusCode: 502 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
