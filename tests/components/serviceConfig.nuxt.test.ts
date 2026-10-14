// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ServiceConfigAccordion from "../../components/ServiceConfigAccordion.vue";
import ServiceConfigOverview from "../../components/ServiceConfigOverview.vue";
import AccordionSection from "../../components/AccordionSection.vue";

describe("AccordionSection accessibility", () => {
  const wrapper = mount(AccordionSection, { props: { title: "Konfiguration" }, slots: { default: "<p>x</p>" } });
  const button = wrapper.find("button");

  it("uses a button inside a heading", () => {
    expect(wrapper.find("h3 > button").exists()).toBe(true);
    expect(button.attributes("type")).toBe("button");
  });

  it("links button and panel via aria-controls / aria-labelledby", () => {
    const panel = wrapper.find('[role="region"]');
    expect(button.attributes("aria-controls")).toBe(panel.attributes("id"));
    expect(panel.attributes("aria-labelledby")).toBe(button.attributes("id"));
  });

  it("toggles aria-expanded and panel visibility", async () => {
    const panel = wrapper.find('[role="region"]');
    expect(button.attributes("aria-expanded")).toBe("false");
    expect(panel.attributes("style")).toContain("display: none");
    await button.trigger("click");
    expect(button.attributes("aria-expanded")).toBe("true");
    expect(panel.attributes("style") ?? "").not.toContain("display: none");
  });

  it("hides the decorative icon from assistive tech", () => {
    expect(wrapper.find("svg").attributes("aria-hidden")).toBe("true");
  });

  it("generates unique ids per instance", () => {
    // useId counters are per app, so uniqueness must be checked within one app
    const parent = mount({
      components: { AccordionSection },
      template: '<div><AccordionSection title="A" /><AccordionSection title="B" /></div>',
    });
    const ids = parent.findAll("button").map((b) => b.attributes("id"));
    expect(new Set(ids).size).toBe(2);
  });
});

describe("config tables accessibility", () => {
  it("overview has caption, column headers and row headers", () => {
    const w = mount(ServiceConfigOverview, { global: { components: { AccordionSection } } });
    const html = w.html();
    expect(w.find("caption").text()).toBe("Konfiguration per tjänst");
    expect(w.findAll('th[scope="col"]').length).toBeGreaterThan(1);
    expect(w.findAll('th[scope="row"]').length).toBeGreaterThan(0);
    expect(html).toContain("direct_post.jwt");
  });

  it("service accordion has a caption naming the service and hides header visually only", () => {
    const w = mount(ServiceConfigAccordion, {
      props: { service: "matcentralen" },
      global: { components: { AccordionSection } },
    });
    expect(w.find("caption").text()).toBe("Konfiguration för Matcentralen");
    expect(w.find("thead").classes()).toContain("sr-only");
  });
});
