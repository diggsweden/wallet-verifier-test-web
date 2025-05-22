<template>
  <div>
    <h1>Client metadata from verifier-backend </h1>
    <pre>{{ data }}</pre>
  </div>
</template>

<script setup>
const runtimeConfig = useRuntimeConfig()
const data = ref('...')

onMounted(async () => {
  try {
    const res = await fetch(runtimeConfig.public.hostApi + '/ui/clientMetadata')
    data.value = await res.json()
  } catch {
    data.value = 'Failed to fetch from verifier-backend!'
  }
})
</script>
