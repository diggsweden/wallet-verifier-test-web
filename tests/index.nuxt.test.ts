import { describe, it, expect, vi } from "vitest";
import { config, flushPromises, mount } from "@vue/test-utils";
import Index from "../pages/index.vue";

config.global.stubs = {
    NuxtLink: {
        template: '<a><slot /></a>'
    }
}

describe("Index", () => {
  it("renders the title", () => {
    const wrapper = mount(Index);
    expect(wrapper.find("h1").text()).toBe("Strumpsorteringscentralen");
  });

  it("shows initial loading state", () => {
    const wrapper = mount(Index);
    expect(wrapper.find(".status-value").text()).toBe("Offline");
  });

  it("calls the verifier status API on mount", () => {
    vi.spyOn(global, "$fetch");

    mount(Index);

    expect(global.$fetch).toHaveBeenCalledWith("/api/verifier-status");
  });

  it.each([
    ["OK", "online"],
    ["Offline", "offline"],
    ["Offline", "unknown"],
  ])(
    "displays '%s' when fetched '%s' from the verifier status API",
    async (expectedDisplay, receivedStatus) => {
      vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ status: receivedStatus }));
      const wrapper = mount(Index);

      await flushPromises();

      expect(wrapper.find(".status-value").text()).toBe(expectedDisplay);
    },
  );

  it("displays 'offline' when failed to fetch from the verifier status API", async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue({}));
    const wrapper = mount(Index);

    await flushPromises();

    expect(wrapper.find(".status-value").text()).toBe("Offline");
  });
});
