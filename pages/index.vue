<!--
SPDX-FileCopyrightText: 2025 The Wallet Test Verifier Web Authors
SPDX-License-Identifier: EUPL-1.2
-->

<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <div class="min-h-screen bg-gray-50">
    <div class="p-8 max-w-3xl mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-800 mb-3">
          Välkommen
        </h1>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4 mx-auto">
            <i class="fa-solid fa-flask-vial text-orange-600 text-2xl"></i>
          </div>
          <p class="text-gray-600 max-w-md mx-auto">
            Våra demoapplikationer är utformade för att simulera verkliga användningsscenarion
          </p>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6 mb-12">
        <NuxtLink
          to="/vaccincentralen"
          class="group relative block bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition-shadow"
        >
          <div class="absolute top-0 right-0 -mt-2 -mr-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Demo
          </div>

          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <i class="fa-solid fa-syringe text-red-500 text-xl"></i>
              </div>
            </div>
            <div>
              <h3 class="font-medium text-gray-800 mb-1">Vaccincentralen</h3>
              <p class="text-sm text-gray-500">Testa att identifiera dig</p>
            </div>
            <div class="ml-auto">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/"
          class="group relative block bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition-shadow"
        >
          <div class="absolute top-0 right-0 -mt-2 -mr-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Demo
          </div>

          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                <i class="fa-solid fa-cog text-orange-900 text-xl"></i>
              </div>
            </div>
            <div>
              <h3 class="font-medium text-gray-800 mb-1">WORK IN PROGRESS</h3>
              <p class="text-sm text-gray-500"></p>
            </div>
            <div class="ml-auto">
              <i class=""></i>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div class="bg-white/80 backdrop-blur rounded-lg shadow-sm p-4 text-center">
        <div class="flex items-center justify-center space-x-2 text-sm">
            <div :class="status.online ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full animate-pulse"></div>
            <span class="text-gray-600">Status:</span>
            <span :class="status.online ? 'text-green-600' : 'text-red-600'" class="status-value font-medium">
              {{ status.online ? 'OK' : 'Offline' }}
            </span>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
const status = ref({ online: false, metadata: {} })

onMounted(async () => {
  try {
    const { status: s, metadata } = await $fetch('/api/verifier-status')
    status.value = { online: s === 'online', metadata }
  } catch (e) {
    status.value = { online: false, metadata: { error: 'Kunde inte hämta status' } }
  }
})
</script>
