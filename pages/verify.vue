<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="p-8 max-w-2xl mx-auto">
      <NuxtLink to="/" class="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors mb-8 group">
        <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        <span class="font-medium">Tillbaka</span>
      </NuxtLink>
      
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
          Strumpsorteringscentralen
        </h1>
      </div>
      
      <div class="bg-white rounded-xl shadow-xl p-10 mb-6 border border-gray-100">
        <div v-if="state === 'initializing'" class="text-center py-12">
          <div class="relative inline-flex">
            <div class="w-16 h-16 bg-blue-600 rounded-full animate-ping absolute inline-flex opacity-20"></div>
            <div class="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full">
              <svg class="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
          </div>
          <p class="mt-6 text-gray-600 font-medium">Förbereder säker verifiering...</p>
        </div>

        <div v-else-if="state === 'waiting'" class="text-center">
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
              <svg class="w-8 h-8 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Verifiera med din digitala plånbok</h2>
            
            <a :href="authUrl" @click="startPolling" class="group inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 mb-6">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              <span>Öppna plånbok på denna enhet</span>
            </a>
            
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-600">eller skanna QR-koden</span>
              </div>
            </div>
            
            <div v-if="qrCodeUrl" class="mt-6">
              <img :src="qrCodeUrl" alt="QR Code" class="mx-auto border-4 border-white shadow-lg rounded-lg" style="width: 250px; height: 250px;">
            </div>
          </div>
          <div class="bg-blue-100 rounded-xl p-4 inline-flex items-center space-x-3">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-sm text-blue-800">
              Återstående tid: <span class="font-mono font-bold text-lg">{{ Math.floor(timeLeft / 60) }}:{{ String(timeLeft % 60).padStart(2, '0') }}</span>
            </p>
          </div>
        </div>

        <div v-else-if="state === 'success'" class="text-center">
          <div class="mb-8">
            <div class="relative inline-flex">
              <div class="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
              <div class="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mt-6 mb-2">Inloggningen lyckades!</h3>
            <p class="text-gray-600">Din identitet har verifierats framgångsrikt</p>
          </div>
          <div v-if="credentials" class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 mb-8">
            <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Verifierad information</h4>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-gray-600 font-medium">Förnamn</span>
                <span class="text-gray-800 font-semibold">{{ credentials.given_name || '-' }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-gray-600 font-medium">Efternamn</span>
                <span class="text-gray-800 font-semibold">{{ credentials.family_name || '-' }}</span>
              </div>
              <div class="flex justify-between items-center py-3">
                <span class="text-gray-600 font-medium">Personnummer</span>
                <span class="text-gray-800 font-semibold font-mono">{{ credentials.personal_administrative_number || '-' }}</span>
              </div>
            </div>
          </div>
          <div class="flex justify-center space-x-4">
            <button @click="reset" class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Verifiera igen
            </button>
            <NuxtLink to="/" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
              Logga ut
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </NuxtLink>
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
      
      <div class="bg-white/80 backdrop-blur rounded-xl shadow-sm p-6 text-center">
        <p class="text-sm text-gray-600">Behöver du hjälp?</p>
        <a href="mailto:support@exempel.se" class="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium mt-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          <span>support@exempel.se</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
const state = ref('initializing')
const transactionId = ref(null)
const authUrl = ref(null)
const qrCodeUrl = ref(null)
const credentials = ref(null)
const error = ref(null)
const timeLeft = ref(90)
const polling = ref(null)

const startVerification = async () => {
  state.value = 'initializing'
  error.value = null

  if (window.location.search.includes('demo=true')) {
    state.value = 'waiting'
    authUrl.value = '#demo'
    setTimeout(() => {
      state.value = 'success'
      credentials.value = { given_name: 'Anna', family_name: 'Andersson', personal_administrative_number: '199001011234' }
    }, 3000)
    return
  }

  try {
    console.log("Making request to server API")
    
    const response = await $fetch('/api/verifier-request', {
      method: 'POST'
    })
    
    console.log("Got response:", response)
    
    qrCodeUrl.value = response.qrCodeDataUrl
    transactionId.value = response.transaction_id
    authUrl.value = response.authUrl
    
    state.value = 'waiting'
    startCountdown()
  } catch (e) {
    console.error("Verification error:", e)
    state.value = 'error'
    error.value = e.data?.message || e.message || 'Kunde inte starta verifieringen'
  }
}

onMounted(() => {
  startVerification()
})

const startPolling = () => {
  if (polling.value) return
  
  polling.value = setInterval(async () => {
    try {
      const result = await $fetch(`/api/verifier-status/${transactionId.value}`)
      
      if (result.status === 'completed') {
        clearInterval(polling.value)
        state.value = 'success'
        credentials.value = result.verifiedCredentials
        timeLeft.value = 90
      } else if (result.status === 'error' || result.status === 'expired') {
        clearInterval(polling.value)
        state.value = 'error'
        error.value = result.error || 'Verifieringen kunde inte slutföras'
        timeLeft.value = 90
      }
    } catch (e) {
      console.error('Polling error:', e)
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

const reset = () => {
  if (polling.value) {
    clearInterval(polling.value)
    polling.value = null
  }
  if (qrCodeUrl.value && qrCodeUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(qrCodeUrl.value)
  }
  
  state.value = 'initializing'
  transactionId.value = null
  authUrl.value = null
  qrCodeUrl.value = null
  credentials.value = null
  error.value = null
  timeLeft.value = 90
  
  startVerification()
}

onUnmounted(() => {
  if (polling.value) clearInterval(polling.value)
  if (qrCodeUrl.value && qrCodeUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(qrCodeUrl.value)
  }
})
</script>