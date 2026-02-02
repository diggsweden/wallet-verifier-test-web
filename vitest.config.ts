// SPDX-FileCopyrightText: 2025 The Wallet Test Verifier Web Authors
//
// SPDX-License-Identifier: EUPL-1.2

import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({ 
  test: {
    environment: 'nuxt',
    environmentOptions: { nuxt: { url: 'http://localhost:3000' }},
  },
});
