// SPDX-FileCopyrightText: 2025 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const storage = useStorage("memory");
  const state = body.state || "latest";
  await storage.setItem(`verification:${state}`, body);
  return { success: true };
});
