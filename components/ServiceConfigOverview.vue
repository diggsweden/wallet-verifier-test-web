<!--
SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
SPDX-License-Identifier: EUPL-1.2
-->

<template>
  <AccordionSection title="Information för utvecklare">
    <h4 class="text-sm font-medium text-gray-600 mb-2">Konfiguration per tjänst</h4>
    <ConfigTable caption="Konfiguration per tjänst" :columns="columns" :rows="rows" />

    <details v-if="backendRows.length > 0" class="mt-3 rounded-lg border border-gray-200 bg-white text-sm">
      <summary class="cursor-pointer py-2 px-4 font-medium text-gray-600 hover:text-gray-800 select-none">
        Visa konfiguration för Verifier Backend
      </summary>
      <div class="border-t border-gray-200">
        <ConfigTable
          caption="Gemensam konfiguration för Verifier Backend"
          :columns="['Värde']"
          :rows="backendRows"
          hide-header
        />
      </div>
    </details>
  </AccordionSection>
</template>

<script setup lang="ts">
import {
  configLabels,
  getBackendConfigRows,
  getServiceDisplayValues,
  serviceConfigs,
  serviceTitles,
  type BackendEnvConfig,
  type DisplayConfigKey,
  type ServiceName,
} from '~~/shared/utils/serviceConfig'

const props = defineProps<{ backendConfig?: BackendEnvConfig | null }>()

const names = Object.keys(serviceConfigs) as ServiceName[]
const columns = names.map((name) => serviceTitles[name])
const displayByService = Object.fromEntries(
  names.map((name) => [name, getServiceDisplayValues(name)]),
) as Record<ServiceName, Record<DisplayConfigKey, string>>

const rows = (Object.keys(configLabels) as DisplayConfigKey[]).map((key) => ({
  key,
  label: configLabels[key],
  values: names.map((name) => displayByService[name][key]),
}))

const backendRows = computed(() =>
  props.backendConfig
    ? getBackendConfigRows(props.backendConfig).map(({ key, label, value }) => ({
        key,
        label,
        values: [value],
      }))
    : [],
)
</script>
