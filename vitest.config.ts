// SPDX-FileCopyrightText: 2025 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({ 
  test: {
    environment: 'nuxt',
    environmentOptions: { nuxt: { url: 'http://localhost:3000' }},
  },
});
