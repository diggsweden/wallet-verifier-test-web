// SPDX-FileCopyrightText: 2026 The Wallet Test Verifier Web Authors
//
// SPDX-License-Identifier: EUPL-1.2

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const handlerCases = [
  {
    route: "vaccincentralen",
    modulePath: "~/server/api/vaccincentralen-request.post",
    loggerTag: "vaccincentralen-request",
  },
  {
    route: "biocentralen",
    modulePath: "~/server/api/biocentralen-request.post",
    loggerTag: "biocentralen-request",
  },
  {
    route: "matcentralen",
    modulePath: "~/server/api/matcentralen-request.post",
    loggerTag: "matcentralen-request",
  },
] as const;

describe("presentation request failure logging", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;
  let defineEventHandlerSpy: ReturnType<typeof vi.fn>;
  let readBodySpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    defineEventHandlerSpy = vi.fn((handler) => handler);
    readBodySpy = vi.fn().mockResolvedValue({ flow_type: "same_device" });

    vi.stubGlobal("$fetch", fetchSpy);
    vi.stubGlobal("defineEventHandler", defineEventHandlerSpy);
    vi.stubGlobal("readBody", readBodySpy);
    vi.stubGlobal("useRuntimeConfig", vi.fn().mockReturnValue({
      public: {
        hostApi: "https://runtime-config.example",
      },
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
    delete process.env.HOST_API;
    delete process.env.INTERNAL_HOST_API;
  });

  it.each(handlerCases.flatMap((handlerCase) => (
    [400, 500].map((statusCode) => ({ ...handlerCase, statusCode }))
  )))(
    "logs the failed PID presentation response for $route when backend returns $statusCode",
    async ({ modulePath, loggerTag, statusCode }) => {
      process.env.HOST_API = "https://backend.example";

      const backendError = Object.assign(
        new Error(`Request failed with status code ${statusCode}`),
        { response: { status: statusCode } },
      );
      fetchSpy.mockRejectedValueOnce(backendError);

      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const { default: handler } = await import(modulePath);

      await expect(handler({} as never)).rejects.toMatchObject({
        statusCode: 500,
        statusMessage: "Failed to create verification request",
      });

      expect(defineEventHandlerSpy).toHaveBeenCalled();
      expect(readBodySpy).toHaveBeenCalled();
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://backend.example/ui/presentations",
        expect.objectContaining({
          method: "POST",
        }),
      );

      const errorLogCall = consoleLogSpy.mock.calls.find(([payload]) => {
        if (typeof payload !== "string") {
          return false;
        }

        const parsedPayload = JSON.parse(payload);
        return parsedPayload.body === "Verifier request failed";
      });

      expect(errorLogCall).toBeDefined();

      const parsedLog = JSON.parse(String(errorLogCall?.[0]));
      expect(parsedLog.severity_text).toBe("ERROR");
      expect(parsedLog.attributes).toMatchObject({
        logger: loggerTag,
        "exception.message": `Request failed with status code ${statusCode}`,
        "http.response.status_code": statusCode,
        "url.full": "https://backend.example/ui/presentations",
      });
    },
  );
});
