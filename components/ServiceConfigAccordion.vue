<!--
SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
SPDX-License-Identifier: EUPL-1.2
-->

<template>
  <AccordionSection title="Konfiguration för denna tjänst" :button-class="accents[service]" class="mt-6 text-left max-w-lg mx-auto">
    <h4 class="text-sm font-medium text-gray-600 mb-2">Scenariokonfiguration</h4>
    <ConfigTable
      :caption="`Konfiguration för ${serviceTitles[service]}`"
      :columns="[serviceTitles[service]]"
      :rows="rows"
      hide-header
    />

    <details class="mt-3 rounded-lg border border-gray-200 bg-white text-sm">
      <summary class="cursor-pointer py-2 px-4 font-medium text-gray-600 hover:text-gray-800 select-none">
        Visa rå dcql_query (JSON)
      </summary>
      <pre class="p-4 text-xs font-mono text-gray-800 bg-gray-50 overflow-x-auto border-t border-gray-200 rounded-b-lg">{{ formattedDcqlQuery }}</pre>
    </details>
  </AccordionSection>
</template>

<script setup lang="ts">
import {
  getConfigRows,
  serviceConfigs,
  serviceTitles,
  type ServiceName,
} from '~~/shared/utils/serviceConfig'

const props = defineProps<{ service: ServiceName }>()

const accents: Record<ServiceName, string> = {
  matcentralen: 'text-green-700 hover:text-green-800',
  biocentralen: 'text-purple-700 hover:text-purple-800',
  vaccincentralen: 'text-red-700 hover:text-red-800',
  jobbcentralen: 'text-blue-700 hover:text-blue-800',
}

const rows = computed(() =>
  getConfigRows(props.service).map(({ key, label, value }) => ({ key, label, values: [value] })),
)

const formattedDcqlQuery = computed(() =>
  JSON.stringify(serviceConfigs[props.service].dcql_query, null, 2),
)
</script>
