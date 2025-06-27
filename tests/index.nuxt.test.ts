import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Index from "../pages/index.vue";

global.fetch = vi.fn();

describe("Index", () => {
  it("renders the title", () => {
    const wrapper = mount(Index);
    expect(wrapper.find("h1").text()).toBe(
      "Client metadata from verifier-backend",
    );
  });

  it("shows initial loading state", () => {
    const wrapper = mount(Index);
    expect(wrapper.find("pre").text()).toBe("...");
  });

  it("calls the API on mount", () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: "test" }),
    } as Response);

    mount(Index);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/ui/clientMetadata",
    );
  });
});
