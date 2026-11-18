<!--
SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
SPDX-License-Identifier: EUPL-1.2
-->

<template>
  <div class="bg-amber-600 text-white text-center py-2 text-sm">DEMO – FELTEST</div>
  <div class="min-h-screen bg-amber-50 text-gray-800">
    <div class="p-8 max-w-2xl mx-auto">
      <NuxtLink to="/" class="inline-block text-amber-800 underline mb-8">Tillbaka</NuxtLink>
      <h1 class="text-4xl font-bold text-center mb-8">Testcentralen</h1>

      <div class="bg-white rounded-xl shadow-sm p-6 sm:p-10 border border-amber-200">
        <h2 class="text-2xl font-semibold mb-4">Utgånget registreringscertifikat</h2>
        <p class="mb-4">
          Den här tjänsten använder avsiktligt ett utgånget registreringscertifikat.
          Plånboken ska stoppa förfrågan och visa ett begripligt felmeddelande innan
          några uppgifter delas.
        </p>
        <p class="text-gray-600 mb-6">Du behöver ha en personidentitet (PID) i plånboken för att genomföra testet.</p>

        <button
          type="button"
          :disabled="loading"
          class="px-6 py-3 bg-amber-700 text-white rounded-xl hover:bg-amber-800 disabled:opacity-50"
          @click="startTest"
        >
          {{ loading ? 'Förbereder testet…' : request ? 'Skapa ny förfrågan' : 'Starta feltest' }}
        </button>

        <p v-if="error" role="alert" class="mt-6 text-red-700">{{ error }}</p>

        <div v-if="request" class="mt-8 text-center">
          <h3 class="text-xl font-semibold mb-4">Öppna förfrågan i plånboken</h3>
          <p class="mb-4">Skanna QR-koden med plånboken på din telefon.</p>
          <div class="w-64 max-w-full aspect-square mx-auto mb-6">
            <Qrcode :value="qrCodeUrl" class="w-full h-full" />
          </div>
          <a :href="walletUrl" class="inline-block px-6 py-3 bg-amber-700 text-white rounded-xl hover:bg-amber-800">
            Öppna plånboken på den här enheten
          </a>
          <p class="mt-6 text-gray-600">
            Kontrollera felmeddelandet i plånboken. Testresultatet bedöms där;
            den här sidan visar ingen automatisk bekräftelse.
          </p>
        </div>

        <ServiceConfigAccordion service="testcentralen" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PresentationRequest {
  client_id: string;
  request_uri: string;
}

const config = useRuntimeConfig();
const request = ref<PresentationRequest | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const requestQuery = computed(() => request.value ? new URLSearchParams({
  client_id: request.value.client_id,
  request_uri: request.value.request_uri,
}).toString() : '');
const qrCodeUrl = computed(() => `openid4vp://?${requestQuery.value}`);
const walletUrl = computed(() => `${config.public.walletUrl}?${requestQuery.value}`);

async function startTest() {
  loading.value = true;
  error.value = null;
  request.value = null;

  try {
    request.value = await $fetch<PresentationRequest>('/api/testcentralen-request', {
      method: 'POST',
    });
  } catch {
    error.value = 'Kunde inte skapa testförfrågan. Försök igen. Om felet kvarstår, kontakta den som ansvarar för testmiljön.';
  } finally {
    loading.value = false;
  }
}
</script>
