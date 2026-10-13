<!--
SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
SPDX-License-Identifier: EUPL-1.2
-->

<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-2 text-sm shadow-md">
    DEMO
  </div>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
    <div class="p-8 max-w-2xl mx-auto">
      <NuxtLink to="/" class="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors mb-8 group">
        <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        <span class="font-medium">Tillbaka</span>
      </NuxtLink>

      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-2">
          Mat&shy;centralen
        </h1>
      </div>

      <div class="bg-white text-center rounded-xl shadow-xl sm:p-10 p-6 mb-6 border border-gray-100">
        <div v-if="state === 'idle'" class="text-center">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-6">
            <i class="fa-solid fa-truck text-green-600 text-3xl"></i>
          </div>
          <h2 class="text-2xl font-semibold text-gray-800 mb-3">Välkommen</h2>
          <p class="text-gray-600 mb-8 max-w-md mx-auto">
            Beställ en matkasse hem till dig. Presentera namn och adressuppgifter från din digitala plånbok så att vi vet vem som ska ta emot matkassen och vart den ska levereras. Därefter väljer du vilken matkasse du vill boka.
          </p>
          <button @click="startVerification" class="group relative inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200">
            <span class="relative">Presentera namn och adress</span>
            <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>

        <div v-else-if="state === 'initializing'" class="text-center py-12">
          <div class="relative inline-flex">
            <div class="w-16 h-16 bg-green-600 rounded-full animate-ping absolute inline-flex opacity-20"></div>
            <div class="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full">
              <i class="fa-solid fa-spinner fa-spin text-white text-2xl"></i>
            </div>
          </div>
          <p class="mt-6 text-gray-600 font-medium">Förbereder säker verifiering...</p>
        </div>

        <div v-else-if="state === 'waiting'">
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-2 sm:p-8 mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
              <i class="fa-solid fa-clock text-green-600 text-2xl"></i>
            </div>
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Väntar på din plånbok</h2>
            <p class="text-gray-600 mb-6">Öppna din digitala plånbok för att slutföra förfrågan</p>

            <div v-if="flowType === 'same_device'">
              <a :href="authUrl" @click="startPolling" target="_blank" class="group inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                <span>Öppna wallet</span>
              </a>
              <div class="mt-6">
                <button @click="switchToCrossDevice" class="text-green-600 hover:text-green-700 text-sm font-medium transition-colors">
                  Har du plånboken på en annan enhet?
                </button>
              </div>
            </div>

            <div v-else>
              <div class="bg-white mx-auto sm:w-[min(250px,90vw)] w-[min(200px,90vw)] aspect-square rounded-xl shadow-xl p-2 border border-gray-100">
                <Qrcode :value="qrcodeUrl" class="w-full h-full mx-auto rounded-xl border-2 border-white"/>
              </div>
              <div class="mt-6">
                <button @click="switchToSameDevice" class="text-green-600 hover:text-green-700 text-sm font-medium transition-colors">
                  Har du plånboken på den här enheten?
                </button>
              </div>
            </div>
          </div>

          <div class="bg-green-100 rounded-xl p-4 inline-flex items-center space-x-3">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-sm text-green-800">
              Återstående tid: <span class="font-mono font-bold text-lg">{{ Math.floor(timeLeft / 60) }}:{{ String(timeLeft % 60).padStart(2, '0') }}</span>
            </p>
          </div>
        </div>

        <div v-else-if="state === 'success'" class="text-center">
          <div class="mb-8">
            <div class="relative inline-flex">
              <div class="absolute inset-0 bg-green-500 rounded-full opacity-20"></div>
              <div class="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mt-6 mb-2">Välj din matkasse</h3>
          </div>

          <div class="max-w-md mx-auto text-left">
            <p class="text-center text-gray-600 leading-relaxed mb-6">
              Välkommen {{ credentials.given_name }}! Välj vart vi ska leverera din matkasse.
            </p>
            <fieldset class="mb-6">
              <legend class="text-gray-700 font-medium mb-2">Leveransadress</legend>
              <label class="flex items-start gap-3 py-2 cursor-pointer">
                <input v-model="deliveryAddressType" type="radio" name="delivery-address" value="wallet" class="mt-1 text-green-600 focus:ring-green-500">
                <span>
                  <span class="block text-gray-800">Adressen från min plånbok</span>
                  <span class="block text-sm text-gray-500">{{ credentials.given_name }} {{ credentials.family_name }}</span>
                  <span class="block text-sm text-gray-500">{{ credentials.street_address }}, {{ credentials.postal_code }} {{ credentials.locality }}</span>
                </span>
              </label>
              <label class="flex items-center gap-3 py-2 cursor-pointer">
                <input v-model="deliveryAddressType" type="radio" name="delivery-address" value="other" class="text-green-600 focus:ring-green-500" aria-controls="alternative-delivery-address">
                <span class="text-gray-800">Leverera till en annan adress</span>
              </label>
              <div v-if="deliveryAddressType === 'other'" id="alternative-delivery-address" class="mt-3 space-y-4">
                <div>
                  <label for="delivery-recipient" class="block text-gray-700 font-medium mb-2">Mottagare</label>
                  <input id="delivery-recipient" v-model="alternativeDeliveryAddress.recipient" autocomplete="shipping name" class="w-full rounded-lg border border-black px-3 py-1.5 text-gray-800 focus:border-green-500 focus:ring-green-100">
                </div>
                <div>
                  <label for="delivery-street" class="block text-gray-700 font-medium mb-2">Gatuadress</label>
                  <input id="delivery-street" v-model="alternativeDeliveryAddress.street" autocomplete="shipping address-line1" class="w-full rounded-lg border border-black px-3 py-1.5 text-gray-800 focus:border-green-500 focus:ring-green-100">
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="delivery-postcode" class="block text-gray-700 font-medium mb-2">Postnummer</label>
                    <input id="delivery-postcode" v-model="alternativeDeliveryAddress.postcode" autocomplete="shipping postal-code" class="w-full rounded-lg border border-black px-3 py-1.5 text-gray-800 focus:border-green-500 focus:ring-green-100">
                  </div>
                  <div>
                    <label for="delivery-locality" class="block text-gray-700 font-medium mb-2">Ort</label>
                    <input id="delivery-locality" v-model="alternativeDeliveryAddress.locality" autocomplete="shipping address-level2" class="w-full rounded-lg border border-black px-3 py-1.5 text-gray-800 focus:border-green-500 focus:ring-green-100">
                  </div>
                </div>
                <p class="text-xs text-gray-500">Den här leveransadressen anges av dig och hämtas inte från plånboken.</p>
              </div>
            </fieldset>
            <label for="meal-kit" class="block text-gray-700 font-medium mb-2">Välj matkasse</label>
            <select id="meal-kit" class="w-full rounded-lg border border-black bg-white px-3 py-1.5 text-gray-800 shadow-sm transition focus:border-green-500 focus:ring-4 focus:ring-green-100">
              <option value="" disabled selected>Välj matkasse</option>
              <option value="classic">Klassiska matkassen</option>
              <option value="vegetarian">Vegetariska matkassen</option>
              <option value="family">Familjematkassen</option>
            </select>
            <label for="delivery-day" class="mt-4 block text-gray-700 font-medium mb-2">Leveransdag</label>
            <select id="delivery-day" class="w-full rounded-lg border border-black bg-white px-3 py-1.5 text-gray-800 shadow-sm transition focus:border-green-500 focus:ring-4 focus:ring-green-100">
              <option value="" disabled selected>Välj veckodag</option>
              <option>Måndag</option>
              <option>Tisdag</option>
              <option>Onsdag</option>
              <option>Torsdag</option>
              <option>Fredag</option>
              <option>Lördag</option>
              <option>Söndag</option>
            </select>
            <button type="button" class="mt-6 w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-200">
              Boka
            </button>
          </div>

          <div class="max-w-md mx-auto text-left">
            <details class="group mt-4">
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
                    <tr class="border-b border-gray-200">
                      <th scope="row" class="py-3 pr-4 text-left font-medium text-gray-500">Födelsedatum</th>
                      <td class="py-3 text-right font-semibold text-gray-800">{{ credentials.birthdate }}</td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <th scope="row" class="py-3 pr-4 text-left font-medium text-gray-500">Gatuadress</th>
                      <td class="py-3 text-right font-semibold text-gray-800">{{ credentials.street_address }}</td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <th scope="row" class="py-3 pr-4 text-left font-medium text-gray-500">Postnummer</th>
                      <td class="py-3 text-right font-semibold text-gray-800">{{ credentials.postal_code }}</td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <th scope="row" class="py-3 pr-4 text-left font-medium text-gray-500">Ort</th>
                      <td class="py-3 text-right font-semibold text-gray-800">{{ credentials.locality }}</td>
                    </tr>
                    <tr>
                      <th scope="row" class="py-3 pr-4 text-left font-medium text-gray-500">Land</th>
                      <td class="py-3 text-right font-semibold text-gray-800">{{ credentials.country }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>
            <p class="mt-4 text-center text-xs text-gray-400">
              Endast exempel, ingen verklig matkasse kan bokas
            </p>
          </div>

        </div>

        <div v-else-if="state === 'error'" class="text-center">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-3">Något gick fel</h3>
          <div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 max-w-md mx-auto">
            <p class="text-green-800">
              {{ error || 'Inloggningen kunde inte slutföras. Försök igen.' }}
            </p>
          </div>
          <button @click="reset" class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
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

const logger = createLogger('matcentralen-page');
const TIMELIMIT = 90;
const state = ref('idle')
const transactionId = ref(null)
const qrcodeUrl = ref(null)
const authUrl = ref(null)
const credentials = ref(null)
const deliveryAddressType = ref('wallet')
const alternativeDeliveryAddress = ref({ recipient: '', street: '', postcode: '', locality: '' })
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
      credentials.value = { given_name: 'Anna', family_name: 'Andersson', birthdate: '1990-01-01', country: 'SE', locality: 'Stockholm', postal_code: '11122', street_address: 'Kungsgatan 1' }
    }, 3000)
    return
  }

  try {
    const response = await $fetch('/api/matcentralen-request', {
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
      const result = await $fetch(`/api/verifier-status/matcentralen/${transactionId.value}`)

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
