<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="p-8 max-w-2xl mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
          Strumpsorteringscentralen
        </h1>
      </div>
      
      <div class="bg-white rounded-xl shadow-xl p-10 mb-8 border border-gray-100">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-semibold text-gray-800 mb-2">Välkommen</h2>
          <p class="text-gray-600 max-w-md mx-auto">Använd din digitala plånbok för att komma åt dina tjänster.</p>
        </div>
        
        <div class="flex justify-center">
          <NuxtLink to="/verify" class="group relative inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200">
            <span class="relative">Logga in med din digitala plånbok</span>
            <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </NuxtLink>
        </div>
      </div>
      
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800 mb-2">Säker inloggning</h3>
              <p class="text-sm text-gray-600">Din identitet skyddas av din digitala plånbok.</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800 mb-2">Snabbt och enkelt</h3>
              <p class="text-sm text-gray-600">Ingen registrering behövs. Logga in direkt med din plånbok.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white/80 backdrop-blur rounded-lg shadow-sm p-4 text-center">
        <div class="flex items-center justify-center space-x-2 text-sm">
          <div :class="status.online ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full animate-pulse"></div>
          <span class="text-gray-600">Status:</span>
          <span :class="status.online ? 'text-green-600' : 'text-red-600'" class="font-medium">
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
  } catch {
    status.value = { online: false, metadata: { error: 'Failed to fetch status' } }
  }
})
</script>