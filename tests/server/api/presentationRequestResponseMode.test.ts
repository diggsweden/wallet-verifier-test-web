// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { beforeEach, describe, expect, it, vi } from "vitest";
import { serviceConfigs } from "~~/shared/utils/serviceConfig";

async function getSentRequestBody(handlerPath: string) {
  const fetchMock = vi.fn().mockResolvedValue({ transaction_id: "tx-1" });
  vi.stubGlobal("$fetch", fetchMock);

  const { default: handler } = await import(handlerPath);
  await handler({});

  const requestOptions = fetchMock.mock.calls[0][1];
  return requestOptions.body;
}

describe("serviceConfig in presentation requests", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, "log").mockImplementation(() => {});

    vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);
    vi.stubGlobal("readBody", async () => ({ flow_type: "cross_device" }));
    vi.stubGlobal("useRuntimeConfig", () => ({ public: {} }));
    vi.stubGlobal("useStorage", () => ({ setItem: async () => {} }));
  });

  it("matcentralen sends configured response_mode, request_uri_method, and dcql_query", async () => {
    const body = await getSentRequestBody("~/server/api/matcentralen-request.post");

    expect(body.response_mode).toBe("direct_post.jwt");
    expect(body.request_uri_method).toBe("get");
    expect(body.dcql_query).toEqual(serviceConfigs.matcentralen.dcql_query);
  });

  it("biocentralen sends configured response_mode and dcql_query", async () => {
    const body = await getSentRequestBody("~/server/api/biocentralen-request.post");

    expect(body.response_mode).toBe("direct_post");
    expect(body.dcql_query).toEqual(serviceConfigs.biocentralen.dcql_query);
  });

  it("vaccincentralen sends configured response_mode and dcql_query", async () => {
    const body = await getSentRequestBody("~/server/api/vaccincentralen-request.post");

    expect(body.response_mode).toBe("direct_post");
    expect(body.dcql_query).toEqual(serviceConfigs.vaccincentralen.dcql_query);
  });

  it("jobbcentralen sends configured response_mode and dcql_query", async () => {
    const body = await getSentRequestBody("~/server/api/jobbcentralen-request.post");

    expect(body.response_mode).toBe("direct_post");
    expect(body.dcql_query).toEqual(serviceConfigs.jobbcentralen.dcql_query);
  });
});
