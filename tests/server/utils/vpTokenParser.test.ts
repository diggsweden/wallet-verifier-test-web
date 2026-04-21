// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { describe, it, expect } from "vitest";
import { parseVpToken } from "~/server/utils/vpTokenParser";

const disclosureBirthdate = ["679abf7d", "birthdate", "1990-01-01"];
const disclosureFamilyName = ["789abf7d", "family_name", "Andersson"];

const encodedDisclosureBirthdate = Buffer.from(JSON.stringify(disclosureBirthdate)).toString("base64url");
const encodedDisclosureFamilyName = Buffer.from(JSON.stringify(disclosureFamilyName)).toString("base64url");

const mockBirthdateCredential = `
  eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.
  eyJpc3MiOiJodHRwczovL2lzc3Vlci5leGFtcGxlLmNvbSIsInZjdCI6InVybjpldWRpOnBpZDoxIn0.
  ~
  ${encodedDisclosureBirthdate}
  ~
  signature
`;

const mockFamilyNameCredential = `
  eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.
  eyJpc3MiOiJodHRwczovL2lzc3Vlci5leGFtcGxlLmNvbSIsInZjdCI6InVybjpldWRpOnBpZDoxIn0.
  ~
  ${encodedDisclosureFamilyName}
  ~
  signature
`;

describe("VP Token Parser", () => {
  describe("Happy Path", () => {
    it("should parse a single credential", () => {
      const input = {
        birthdate_credential: [mockBirthdateCredential],
      };
      const result = parseVpToken(input);
      expect(result.birthdate).toBe("1990-01-01");
      expect(result.issuer).toBe("https://issuer.example.com");
      expect(result.vct).toBe("urn:eudi:pid:1");
    });

    it("should parse multiple credentials", () => {
      const input = {
        birthdate_credential: [mockBirthdateCredential],
        family_name_credential: [mockFamilyNameCredential],
      };
      const result = parseVpToken(input);
      expect(result.birthdate).toBe("1990-01-01");
      expect(result.family_name).toBe("Andersson");
      expect(result.issuer).toBe("https://issuer.example.com");
    });

    it("should handle nested credentials", () => {
      const input = {
        nested_credential: {
          inner_credential: [mockBirthdateCredential],
        },
      };
      const result = parseVpToken(input);
      expect(result.birthdate).toBe("1990-01-01");
    });
  });

  describe("Error Cases", () => {
    it("should throw an error for invalid input", () => {
      expect(() => parseVpToken("invalid")).toThrow("Invalid VP Token");
    });

    it("should throw an error for null input", () => {
      expect(() => parseVpToken(null)).toThrow("No VP Tokens found");
    });

    it("should throw an error for undefined input", () => {
      expect(() => parseVpToken(undefined)).toThrow("No VP Tokens found");
    });

    it("should throw an error for empty object", () => {
      expect(() => parseVpToken({})).toThrow("No VP Tokens found");
    });

    it("should throw an error for empty array", () => {
      expect(() => parseVpToken([])).toThrow("No VP Tokens found");
    });
  });

  describe("Malformed Token Cases", () => {
    it("should throw an error for malformed JWT", () => {
      const input = {
        birthdate_credential: ["not.a.valid.jwt"],
      };
      expect(() => parseVpToken(input)).toThrow("Invalid VP Token");
    });

    it("should throw an error for missing disclosures", () => {
      const input = {
        birthdate_credential: ["eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2lzc3Vlci5leGFtcGxlLmNvbSJ9.~signature"],
      };
      expect(() => parseVpToken(input)).toThrow("Invalid VP Token: Missing issuer or vct");
    });

    it("should throw an error for invalid base64 in disclosures", () => {
      const input = {
        birthdate_credential: ["eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2lzc3Vlci5leGFtcGxlLmNvbSJ9.~not-base64~signature"],
      };
      expect(() => parseVpToken(input)).toThrow("Invalid VP Token");
    });
  });

  describe("Edge Cases", () => {
    it("should handle deeply nested credentials", () => {
      const input = {
        level1: {
          level2: {
            level3: [mockBirthdateCredential],
          },
        },
      };
      const result = parseVpToken(input);
      expect(result.birthdate).toBe("1990-01-01");
    });

    it("should handle arrays of credentials", () => {
      const input = {
        credentials: [
          mockBirthdateCredential,
          mockFamilyNameCredential,
        ],
      };
      const result = parseVpToken(input);
      expect(result.birthdate).toBe("1990-01-01");
      expect(result.family_name).toBe("Andersson");
    });

    it("should throw an error for mixed valid and invalid credentials", () => {
      const input = {
        valid_credential: [mockBirthdateCredential],
        invalid_credential: ["not.a.valid.jwt"],
      };
      expect(() => parseVpToken(input)).toThrow("Invalid VP Token");
    });
  });
});
