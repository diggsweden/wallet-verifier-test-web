// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import {
  getConfigRows,
  getServiceDisplayValues,
} from "~~/shared/utils/serviceConfig";
import AccordionSection from "../../components/AccordionSection.vue";
import ConfigTable from "../../components/ConfigTable.vue";
import ServiceConfigAccordion from "../../components/ServiceConfigAccordion.vue";
import ServiceConfigOverview from "../../components/ServiceConfigOverview.vue";

describe("serviceConfig display values", () => {
  it("extracts required and optional claims for matcentralen", () => {
    const values = getServiceDisplayValues("matcentralen");

    expect(values.response_mode).toBe("direct_post.jwt");
    expect(values.request_uri_method).toBe("get");
    expect(values.formats).toBe("dc+sd-jwt");
    expect(values.vct_values).toBe("urn:eudi:pid:1");
    expect(values.required_claims).toBe(
      "given_name, family_name, address.street_address, address.postal_code, address.locality, address.country",
    );
    expect(values.optional_claims).toBe("birthdate");
  });

  it("extracts required and optional claims for biocentralen", () => {
    const values = getServiceDisplayValues("biocentralen");

    expect(values.response_mode).toBe("direct_post");
    expect(values.required_claims).toBe("birthdate");
    expect(values.optional_claims).toBe("family_name");
  });

  it("marks all claims as required when credential_sets are omitted in vaccincentralen", () => {
    const values = getServiceDisplayValues("vaccincentralen");

    expect(values.response_mode).toBe("direct_post");
    expect(values.required_claims).toBe(
      "family_name, given_name, personal_administrative_number",
    );
    expect(values.optional_claims).toBe("–");
  });

  it("builds labeled rows for a service", () => {
    const rows = getConfigRows("vaccincentralen");

    expect(rows.map((r) => r.key)).toEqual([
      "response_mode",
      "request_uri_method",
      "formats",
      "vct_values",
      "required_claims",
      "optional_claims",
    ]);
  });
});

describe("ServiceConfigAccordion and ServiceConfigOverview components", () => {
  it("renders scenario configuration and collapsible raw dcql_query JSON in ServiceConfigAccordion", () => {
    const wrapper = mount(ServiceConfigAccordion, {
      props: { service: "matcentralen" },
      global: { components: { AccordionSection, ConfigTable } },
    });

    const text = wrapper.text();
    expect(text).toContain("Konfiguration för denna tjänst");
    expect(text).toContain("direct_post.jwt");
    expect(text).toContain("address.street_address");
    expect(text).toContain("Visa rå dcql_query (JSON)");
    expect(text).not.toContain("Verifier Backend");
  });

  it("renders all three services and collapsible Verifier Backend config in ServiceConfigOverview", () => {
    const wrapper = mount(ServiceConfigOverview, {
      props: {
        backendConfig: {
          backendVersion: "0.12.0",
          clientIdScheme: "x509_san_dns",
          jarSigningAlgorithm: "ES256",
          statusCheckEnabled: "false",
          walletUrl: "openid4vp://",
          baseUrl: "https://localhost/demo-verifier",
        },
      },
      global: { components: { AccordionSection, ConfigTable } },
    });

    const text = wrapper.text();
    expect(text).toContain("Matcentralen");
    expect(text).toContain("Biocentralen");
    expect(text).toContain("Vaccincentralen");
    expect(text).toContain("personal_administrative_number");
    expect(text).toContain("Visa konfiguration för Verifier Backend");
    expect(text).toContain("0.12.0");
    expect(text).toContain("x509_san_dns");
    expect(text).toContain("ES256");
  });
});
