// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { beforeEach, describe, expect, it, vi } from "vitest";

// Calls a request handler and returns the response_mode it put in the request body.
async function getSentResponseMode(handlerPath: string) {
  const fetchMock = vi.fn().mockResolvedValue({ transaction_id: "tx-1" });
  vi.stubGlobal("$fetch", fetchMock);

  const { default: handler } = await import(handlerPath);
  await handler({});

  const requestOptions = fetchMock.mock.calls[0][1];
  return requestOptions.body.response_mode;
}

// One service is enough: this verifies the handler puts the per-service config into the
// request body, not every service's value. matcentralen is the only one with direct_post.jwt,
// so the test fails if the handler hardcodes the response_mode instead of reading the config.
describe("response_mode in the presentation request", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, "log").mockImplementation(() => {});

    // Stand-ins for Nuxt/Nitro globals the handlers use
    vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);
    vi.stubGlobal("readBody", async () => ({ flow_type: "cross_device" }));
    vi.stubGlobal("useRuntimeConfig", () => ({ public: {} }));
    vi.stubGlobal("useStorage", () => ({ setItem: async () => {} }));
  });

  it("matcentralen uses direct_post.jwt", async () => {
    expect(await getSentResponseMode("~/server/api/matcentralen-request.post")).toBe("direct_post.jwt");
  });
});
