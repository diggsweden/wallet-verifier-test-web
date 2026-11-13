// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { describe, it, expect } from "vitest";
import { namesMatch } from "~~/shared/utils/credentialNames";

describe("namesMatch", () => {
  const pid = { family_name: "Ström", given_name: "Fredrik" };

  it("matches identical names", () => {
    expect(namesMatch(pid, { ...pid })).toBe(true);
  });

  it("ignores case, surrounding and repeated whitespace", () => {
    expect(namesMatch(pid, { family_name: " STRÖM ", given_name: "fredrik" })).toBe(true);
    expect(
      namesMatch(
        { family_name: "Nyberg", given_name: "Klaudia  Anastasia" },
        { family_name: "Nyberg", given_name: "Klaudia Anastasia" },
      ),
    ).toBe(true);
  });

  it("treats composed and decomposed characters as equal", () => {
    expect(namesMatch(pid, { family_name: "Ström", given_name: "Fredrik" })).toBe(true);
  });

  it("does not match a different person", () => {
    expect(
      namesMatch(pid, { family_name: "Nyberg", given_name: "Klaudia Anastasia" }),
    ).toBe(false);
  });

  it("does not match when only one name part differs", () => {
    expect(namesMatch(pid, { family_name: "Ström", given_name: "Fredrika" })).toBe(false);
  });

  it("does not match when a name is missing on either side", () => {
    expect(namesMatch(pid, undefined)).toBe(false);
    expect(namesMatch(pid, { family_name: "Ström" })).toBe(false);
    expect(namesMatch(undefined, pid)).toBe(false);
    expect(namesMatch({ family_name: "", given_name: "" }, { family_name: "", given_name: "" })).toBe(false);
  });
});
