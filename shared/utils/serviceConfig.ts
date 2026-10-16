// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

/**
 * Single source of truth for per-service use case configuration.
 * Used by the server request handlers and displayed in the UI.
 *
 * To add a new config option: add its key to `ServiceConfig`, give it a label
 * in `configLabels`, and set a value for each service in `serviceConfigs`.
 */
export type ResponseMode = "direct_post" | "direct_post.jwt";

export interface ServiceConfig {
  response_mode: ResponseMode;
}

export type ServiceName = "matcentralen" | "biocentralen" | "vaccincentralen";

export const serviceTitles: Record<ServiceName, string> = {
  matcentralen: "Matcentralen",
  biocentralen: "Biocentralen",
  vaccincentralen: "Vaccincentralen",
};

export const configLabels: Record<keyof ServiceConfig, string> = {
  response_mode: "Response mode",
};

export const serviceConfigs: Record<ServiceName, ServiceConfig> = {
  matcentralen: { response_mode: "direct_post.jwt" },
  biocentralen: { response_mode: "direct_post" },
  vaccincentralen: { response_mode: "direct_post" },
};

export const getConfigRows = (service: ServiceName) =>
  (Object.entries(serviceConfigs[service]) as [keyof ServiceConfig, string][]).map(
    ([key, value]) => ({ key, label: configLabels[key], value }),
  );
