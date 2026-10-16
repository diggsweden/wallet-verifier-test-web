<!--
SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
SPDX-License-Identifier: EUPL-1.2
-->

<template>
  <AccordionSection title="Information för utvecklare">
    <h4 class="text-sm font-medium text-gray-600 mb-2">Konfiguration</h4>
    <ConfigTable caption="Konfiguration per tjänst" :columns="columns" :rows="rows" />
  </AccordionSection>
</template>

<script setup lang="ts">
import { configLabels, serviceConfigs, serviceTitles, type ServiceName } from '~~/shared/utils/serviceConfig'

const names = Object.keys(serviceConfigs) as ServiceName[]
const columns = names.map((name) => serviceTitles[name])
const rows = (Object.keys(configLabels) as (keyof typeof configLabels)[]).map((key) => ({
  key,
  label: configLabels[key],
  values: names.map((name) => serviceConfigs[name][key]),
}))
</script>
