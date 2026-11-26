// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

/**
 * Single source of truth for per-service use case configuration.
 * Used by the server request handlers and displayed in the UI.
 */
export type ResponseMode = "direct_post" | "direct_post.jwt";
export type RequestUriMethod = "get" | "post";
export type ServiceName =
  | "matcentralen"
  | "biocentralen"
  | "vaccincentralen"
  | "jobbcentralen";

export interface DcqlClaim {
  path: string[];
  values?: unknown[];
}

export interface DcqlCredential {
  id: string;
  format: string;
  meta: {
    vct_values: string[];
  };
  claims: DcqlClaim[];
}

export interface DcqlCredentialSet {
  options: string[][];
  required?: boolean;
}

export interface DcqlQuery {
  credentials: DcqlCredential[];
  credential_sets?: DcqlCredentialSet[];
}

export interface ServiceConfig {
  response_mode: ResponseMode;
  request_uri_method: RequestUriMethod;
  dcql_query: DcqlQuery;
}

export interface BackendEnvConfig {
  backendVersion: string;
  walletUrl: string;
  baseUrl: string;
}

export const serviceTitles: Record<ServiceName, string> = {
  matcentralen: "Matcentralen",
  biocentralen: "Biocentralen",
  vaccincentralen: "Vaccincentralen",
  jobbcentralen: "Jobbcentralen",
};

export const serviceConfigs: Record<ServiceName, ServiceConfig> = {
  matcentralen: {
    response_mode: "direct_post.jwt",
    request_uri_method: "get",
    dcql_query: {
      credentials: [
        {
          id: "address_credential",
          format: "dc+sd-jwt",
          meta: {
            vct_values: ["urn:eudi:pid:1"],
          },
          claims: [
            { path: ["given_name"] },
            { path: ["family_name"] },
            { path: ["address", "street_address"] },
            { path: ["address", "postal_code"] },
            { path: ["address", "locality"] },
            { path: ["address", "country"] },
          ],
        },
        {
          id: "birthdate_credential",
          format: "dc+sd-jwt",
          meta: {
            vct_values: ["urn:eudi:pid:1"],
          },
          claims: [{ path: ["birthdate"] }],
        },
      ],
      credential_sets: [
        {
          options: [["address_credential"]],
          required: true,
        },
        {
          options: [["birthdate_credential"]],
          required: false,
        },
      ],
    },
  },
  biocentralen: {
    response_mode: "direct_post",
    request_uri_method: "get",
    dcql_query: {
      credentials: [
        {
          id: "birthdate_credential",
          format: "dc+sd-jwt",
          meta: {
            vct_values: ["urn:eudi:pid:1"],
          },
          claims: [{ path: ["birthdate"] }],
        },
        {
          id: "family_name_credential",
          format: "dc+sd-jwt",
          meta: {
            vct_values: ["urn:eudi:pid:1"],
          },
          claims: [{ path: ["family_name"] }],
        },
      ],
      credential_sets: [
        {
          options: [["birthdate_credential"]],
          required: true,
        },
        {
          options: [["family_name_credential"]],
          required: false,
        },
      ],
    },
  },
  vaccincentralen: {
    response_mode: "direct_post",
    request_uri_method: "get",
    dcql_query: {
      credentials: [
        {
          id: "query_0",
          format: "dc+sd-jwt",
          meta: {
            vct_values: ["urn:eudi:pid:1"],
          },
          claims: [
            { path: ["family_name"] },
            { path: ["given_name"] },
            { path: ["personal_administrative_number"] },
          ],
        },
      ],
    },
  },
  jobbcentralen: {
    response_mode: "direct_post",
    request_uri_method: "get",
    dcql_query: {
      credentials: [
        {
          id: "learning",
          format: "dc+sd-jwt",
          meta: {
            vct_values: ["urn:eu.europa.ec.eudi:learning:credential:1"],
          },
          claims: [
            { path: ["family_name"] },
            { path: ["given_name"] },
            { path: ["achievement_title"] },
            { path: ["assessment_grade"] },
          ],
        },
      ],
    },
  },
};

export type DisplayConfigKey =
  | "response_mode"
  | "request_uri_method"
  | "formats"
  | "vct_values"
  | "required_claims"
  | "optional_claims";

export const configLabels: Record<DisplayConfigKey, string> = {
  response_mode: "Response mode",
  request_uri_method: "Request URI method",
  formats: "Accepterade intygsformat",
  vct_values: "Efterfrågade intyg (vct_values)",
  required_claims: "Obligatoriska attribut",
  optional_claims: "Frivilliga attribut",
};

export const backendConfigLabels: Record<keyof BackendEnvConfig, string> = {
  backendVersion: "Backend-version",
  walletUrl: "Förväntat wallet-URL-schema",
  baseUrl: "Bas-URL (verifierare)",
};

const formatClaim = (claim: DcqlClaim): string => {
  const path = claim.path.join(".");
  if (claim.values && claim.values.length > 0) {
    return `${path}=${JSON.stringify(claim.values)}`;
  }
  return path;
};

export const getCredentialClaimsByRequirement = (dcql: DcqlQuery) => {
  const credentialMap = new Map(dcql.credentials.map((c) => [c.id, c]));

  if (!dcql.credential_sets || dcql.credential_sets.length === 0) {
    const required = dcql.credentials.flatMap((c) => c.claims.map(formatClaim));
    return { required, optional: [] as string[] };
  }

  const required: string[] = [];
  const optional: string[] = [];

  for (const set of dcql.credential_sets) {
    const isRequired = set.required !== false;
    const credIds = set.options.flat();
    for (const id of credIds) {
      const cred = credentialMap.get(id);
      if (cred) {
        const claims = cred.claims.map(formatClaim);
        if (isRequired) {
          required.push(...claims);
        } else {
          optional.push(...claims);
        }
      }
    }
  }

  return { required, optional };
};

export const getServiceDisplayValues = (
  service: ServiceName,
): Record<DisplayConfigKey, string> => {
  const cfg = serviceConfigs[service];
  const formats = Array.from(
    new Set(cfg.dcql_query.credentials.map((c) => c.format)),
  ).join(", ");
  const vcts = Array.from(
    new Set(cfg.dcql_query.credentials.flatMap((c) => c.meta.vct_values)),
  ).join(", ");
  const { required, optional } = getCredentialClaimsByRequirement(
    cfg.dcql_query,
  );

  return {
    response_mode: cfg.response_mode,
    request_uri_method: cfg.request_uri_method,
    formats,
    vct_values: vcts,
    required_claims: required.length > 0 ? required.join(", ") : "–",
    optional_claims: optional.length > 0 ? optional.join(", ") : "–",
  };
};

export const getConfigRows = (service: ServiceName) => {
  const displayValues = getServiceDisplayValues(service);
  return (Object.keys(configLabels) as DisplayConfigKey[]).map((key) => ({
    key,
    label: configLabels[key],
    value: displayValues[key],
  }));
};

export const getBackendConfigRows = (backendConfig: BackendEnvConfig) =>
  (Object.keys(backendConfigLabels) as (keyof BackendEnvConfig)[]).map(
    (key) => ({
      key,
      label: backendConfigLabels[key],
      value: backendConfig[key],
    }),
  );
