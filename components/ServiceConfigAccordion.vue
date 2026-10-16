<!--
SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
SPDX-License-Identifier: EUPL-1.2
-->

<template>
  <AccordionSection title="Information för utvecklare" :button-class="accents[service]" class="mt-6 text-left max-w-md mx-auto">
    <h4 class="text-sm font-medium text-gray-600 mb-2">Konfiguration</h4>
    <ConfigTable
      :caption="`Konfiguration för ${serviceTitles[service]}`"
      :columns="[serviceTitles[service]]"
      :rows="rows"
      hide-header
    />
  </AccordionSection>
</template>

<script setup lang="ts">
import { getConfigRows, serviceTitles, type ServiceName } from '~~/shared/utils/serviceConfig'

const props = defineProps<{ service: ServiceName }>()

const accents: Record<ServiceName, string> = {
  matcentralen: 'text-green-700 hover:text-green-800',
  biocentralen: 'text-purple-700 hover:text-purple-800',
  vaccincentralen: 'text-red-700 hover:text-red-800',
}

const rows = computed(() =>
  getConfigRows(props.service).map(({ key, label, value }) => ({ key, label, values: [value] })),
)
</script>
