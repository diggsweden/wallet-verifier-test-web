<!--
SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
SPDX-License-Identifier: EUPL-1.2
-->

<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-2 text-sm shadow-md">
    DEMO
  </div>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
    <div class="p-8 max-w-2xl mx-auto">
      <NuxtLink to="/" class="inline-flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors mb-8 group">
        <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        <span class="font-medium">Tillbaka</span>
      </NuxtLink>

      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 mb-2">
          Vaccin&shy;centralen
        </h1>
      </div>

      <div class="bg-white text-center rounded-xl shadow-xl sm:p-10 p-6 mb-6 border border-gray-100">
        <div v-if="state === 'idle'" class="text-center">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mb-6">
            <i class="fa-solid fa-syringe text-red-600 text-3xl"></i>
          </div>
          <h2 class="text-2xl font-semibold text-gray-800 mb-3">Välkommen</h2>
          <p class="text-gray-600 mb-8 max-w-md mx-auto">
            För att säkerställa att du får rätt vaccin och dos,
            bekräfta din identitet med din digitala plånbok.
          </p>
          <button @click="startVerification" class="group relative inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200">
            <span class="relative">Identifiera dig</span>
            <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>

        <div v-else-if="state === 'initializing'" class="text-center py-12">
          <div class="relative inline-flex">
            <div class="w-16 h-16 bg-red-600 rounded-full animate-ping absolute inline-flex opacity-20"></div>
            <div class="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-full">
              <i class="fa-solid fa-spinner fa-spin text-white text-2xl"></i>
            </div>
          </div>
          <p class="mt-6 text-gray-600 font-medium">Förbereder säker verifiering...</p>
        </div>

        <div v-else-if="state === 'waiting'">
          <div class="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-2 sm:p-8 mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
              <i class="fa-solid fa-clock text-red-600 text-2xl"></i>
            </div>
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Väntar på din plånbok</h2>
            <p class="text-gray-600 mb-6">Öppna din digitala plånbok för att slutföra identifieringen</p>

            <div v-if="flowType === 'same_device'">
              <a :href="authUrl" @click="startPolling" target="_blank" class="group inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                <span>Öppna wallet</span>
              </a>
              <div class="mt-6">
                <button @click="switchToCrossDevice" class="text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
                  Har du plånboken på en annan enhet?
                </button>
              </div>
            </div>

            <div v-else>
              <div class="bg-white mx-auto sm:w-[min(250px,90vw)] w-[min(200px,90vw)] aspect-square rounded-xl shadow-xl p-2 border border-gray-100">
                <Qrcode :value="qrcodeUrl" class="w-full h-full mx-auto rounded-xl border-2 border-white"/>
              </div>
              <div class="mt-6">
                <button @click="switchToSameDevice" class="text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
                  Har du plånboken på den här enheten?
                </button>
              </div>
            </div>
          </div>

          <div class="bg-red-100 rounded-xl p-4 inline-flex items-center space-x-3">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-sm text-red-800">
              Återstående tid: <span class="font-mono font-bold text-lg">{{ Math.floor(timeLeft / 60) }}:{{ String(timeLeft % 60).padStart(2, '0') }}</span>
            </p>
          </div>
        </div>

        <div v-else-if="state === 'success'" class="text-center">
          <div class="mb-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Välkommen {{ credentials.given_name}}!</h3>
          </div>

          <div class="max-w-md mx-auto text-left">
            <div class="mb-8 border-y border-gray-200 py-3">
              <div class="grid grid-cols-3 gap-2 text-center text-xs font-semibold leading-tight sm:text-sm">
                <span class="text-pink-600">1. Välj behandling</span>
                <span class="text-gray-400">2. Välj tid</span>
                <span class="text-gray-400">3. Boka</span>
              </div>
            </div>

            <p class="text-gray-600 text-center mb-6">
              Vänligen välj behandling och lokal.
            </p>

            <div class="space-y-4">
              <div>
                <label for="appointment" class="block text-gray-700 font-medium mb-2">Behandling</label>
                <select id="appointment" class="w-full rounded-lg border border-black bg-white px-3 py-1.5 text-gray-800 shadow-sm transition focus:border-green-500 focus:ring-4 focus:ring-green-100">
                  <option>Välj Behandling</option>
                  <option>Vaccination mot TBE</option>
                  <option>Vaccination mot vattkoppor</option>
                </select>
              </div>

              <div>
                <label for="clinic" class="block text-gray-700 font-medium mb-2">Vaccinationsmottagning</label>
                <select id="clinic" class="w-full rounded-lg border border-black bg-white px-3 py-1.5 text-gray-800 shadow-sm transition focus:border-green-500 focus:ring-4 focus:ring-green-100">
                  <option>Välj Vaccinationsmottagning</option>
                  <option>Citygatan 12B</option>
                  <option>Köpcentrum 99</option>
                  <option>Sjukhusflygel A</option>
                </select>
              </div>
            </div>

            <button type="button" class="group mt-6 inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-pink-500 to-red-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:from-pink-600 hover:to-red-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-pink-200">
              <span>Se lediga tider</span>
              <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>

            <details class="group mt-4 text-left">
              <summary class="list-none cursor-pointer px-1 py-2 text-xs text-gray-400 transition hover:text-gray-500">
                <span class="group-open:hidden">↓</span><span class="hidden group-open:inline">→</span>
                Uppgifter från plånboken
              </summary>
              <div class="mt-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2">
                <table class="w-full text-sm">
                  <tbody>
                    <tr class="border-b border-gray-200">
                      <th scope="row" class="py-3 pr-4 text-left font-medium text-gray-500">Förnamn</th>
                      <td class="py-3 text-right font-semibold text-gray-800">{{ credentials.given_name }}</td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <th scope="row" class="py-3 pr-4 text-left font-medium text-gray-500">Efternamn</th>
                      <td class="py-3 text-right font-semibold text-gray-800">{{ credentials.family_name }}</td>
                    </tr>
                    <tr>
                      <th scope="row" class="py-3 pr-4 text-left font-medium text-gray-500">Personnummer</th>
                      <td class="py-3 text-right font-semibold text-gray-800 font-mono">{{ credentials.personal_administrative_number }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>

            <p class="mt-4 text-center text-xs text-gray-400">
              Endast exempel, ingen verklig tid kan bokas
            </p>
          </div>
        </div>

        <div v-else-if="state === 'error'" class="text-center">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-3">Något gick fel</h3>
          <div class="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 max-w-md mx-auto">
            <p class="text-red-800">
              {{ error || 'Inloggningen kunde inte slutföras. Försök igen.' }}
            </p>
          </div>
          <button @click="reset" class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Försök igen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { createLogger } from '../utils/logger.client';

const logger = createLogger('vaccincentralen-page');
const TIMELIMIT = 90;
const state = ref('idle')
const transactionId = ref(null)
const qrcodeUrl = ref(null)
const authUrl = ref(null)
const credentials = ref(null)
const error = ref(null)
const timeLeft = ref(TIMELIMIT)
const polling = ref(null)
const flowType = ref('qr_code')
const config = useRuntimeConfig()
const route = useRoute()

onMounted(() => {
  if (route.query.success) {
    try {
      const data = JSON.parse(decodeURIComponent(route.query.data))
      state.value = 'success'
      credentials.value = data
    } catch (e) {
      logger.error('Failed to load verification data', e)
      state.value = 'error'
      error.value = 'Failed to load verification data'
    }
  } else if (route.query.error) {
    state.value = 'error'
    error.value = decodeURIComponent(route.query.error)
  }
})
const walletBaseUrl = config.public.walletUrl

const startVerification = async () => {
  state.value = 'initializing'
  error.value = null

  if (window.location.search.includes('demo=true')) {
    state.value = 'waiting'
    authUrl.value = '#demo'
    qrcodeUrl.value = '#demo'
    setTimeout(() => {
      state.value = 'success'
      credentials.value = { given_name: 'Anna', family_name: 'Andersson', personal_administrative_number: '199001011234' }
    }, 3000)
    return
  }

  try {
    const response = await $fetch('/api/vaccincentralen-request', {
      method: 'POST',
      body: { type: 'vp_token', request_uri_method: "get", flow_type: flowType.value }
    })

    transactionId.value = response.transaction_id
    const requestUri = response.request_uri
    const clientId = response.client_id || 'Verifier'

    qrcodeUrl.value = `openid4vp://?client_id=${encodeURIComponent(clientId)}&request_uri=${encodeURIComponent(requestUri)}`
    authUrl.value = `${walletBaseUrl}?client_id=${encodeURIComponent(clientId)}&request_uri=${encodeURIComponent(requestUri)}`
    state.value = 'waiting'
    startCountdown()
  } catch (e) {
    logger.error('Failed to start verification', e)
    state.value = 'error'
    error.value = e.data?.message || e.message || 'Kunde inte starta verifieringen'
  }
}

const startPolling = () => {
  if (polling.value) return

  polling.value = setInterval(async () => {
    try {
      const result = await $fetch(`/api/verifier-status/vaccincentralen/${transactionId.value}`)

      if (result.status === 'completed') {
        clearInterval(polling.value)
        state.value = 'success'
        credentials.value = result.verifiedCredentials
        timeLeft.value = TIMELIMIT
      } else if (result.status === 'error' || result.status === 'expired') {
        clearInterval(polling.value)
        state.value = 'error'
        error.value = result.error || 'Verifieringen kunde inte slutföras'
        timeLeft.value = TIMELIMIT
      }
    } catch (e) {
      logger.error('Polling error', e)
    }
  }, 2000)
}

const startCountdown = () => {
  const countdown = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(countdown)
      clearInterval(polling.value)
      if (state.value === 'waiting') {
        state.value = 'error'
        error.value = 'Tidsgränsen för verifiering har löpt ut.'
      }
    }
  }, 1000)

  setTimeout(() => {
    if (state.value === 'waiting' && !polling.value) startPolling()
  }, 5000)
}

const switchToSameDevice = async () => {
  flowType.value = 'same_device'
  await startVerification()
}

const switchToCrossDevice = async () => {
  flowType.value = 'qr_code'
  await startVerification()
}

const reset = () => {
  state.value = 'idle'
  transactionId.value = null
  authUrl.value = null
  qrcodeUrl.value = null
  credentials.value = null
  error.value = null
  timeLeft.value = TIMELIMIT
  flowType.value = 'qr_code'
  if (polling.value) {
    clearInterval(polling.value)
    polling.value = null
  }
}

onUnmounted(() => {
  if (polling.value) clearInterval(polling.value)
})
</script>
