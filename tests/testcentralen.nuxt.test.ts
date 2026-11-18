// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError } from "h3";
import Testcentralen from "../pages/testcentralen.vue";

describe("Testcentralen page", () => {
  let unregister: (() => void) | undefined;
  afterEach(() => unregister?.());

  it("opens the real wallet request even with the offline demo query parameter", async () => {
    const requestUri = "https://backend.example/wallet/request.jwt/request-1";
    const createRequest = vi.fn(() => ({
      client_id: "x509_san_dns:backend.example",
      request_uri: requestUri,
    }));
    unregister = registerEndpoint("/api/testcentralen-request", {
      method: "POST",
      handler: createRequest,
    });
    const wrapper = await mountSuspended(Testcentralen, {
      route: "/testcentralen?demo=true",
    });

    await wrapper.get("button").trigger("click");
    await flushPromises();

    expect(createRequest).toHaveBeenCalledOnce();
    const walletLink = wrapper.get<HTMLAnchorElement>('a[href^="openid4vp:"]');
    const walletUrl = new URL(walletLink.element.href);
    expect(walletUrl.searchParams.get("request_uri")).toBe(requestUri);
    expect(walletUrl.searchParams.get("client_id")).toBe("x509_san_dns:backend.example");
    expect(wrapper.text()).toContain("Kontrollera felmeddelandet i plånboken");
    wrapper.unmount();
  });

  it("shows a setup error without a wallet link when a request cannot be created", async () => {
    unregister = registerEndpoint("/api/testcentralen-request", {
      method: "POST",
      handler: () => { throw createError({ statusCode: 502 }); },
    });
    const wrapper = await mountSuspended(Testcentralen);

    await wrapper.get("button").trigger("click");
    await flushPromises();

    expect(wrapper.get('[role="alert"]').text()).toContain("Kunde inte skapa testförfrågan");
    expect(wrapper.find('a[href^="openid4vp:"]').exists()).toBe(false);
    expect(wrapper.get("button").attributes("disabled")).toBeUndefined();
    wrapper.unmount();
  });
});
