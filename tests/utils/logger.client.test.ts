// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

// @vitest-environment node

import { describe, it, expect, vi, afterEach } from "vitest";
import { createLogger } from "~/utils/logger.client";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createLogger", () => {
  it.each([
    ["info", "log"],
    ["debug", "log"],
    ["warn", "log"],
    ["error", "error"],
  ] as const)("logs %s to console.%s", (level, method) => {
    const spy = vi.spyOn(console, method).mockImplementation(() => {});

    createLogger("test-tag")[level]("a message", { count: 2 });

    expect(spy).toHaveBeenCalledWith(
      JSON.stringify({
        tag: "test-tag",
        level: level.toUpperCase(),
        message: "a message",
        count: 2,
      }),
    );
  });
});
