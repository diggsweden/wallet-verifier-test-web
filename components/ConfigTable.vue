<!--
SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
SPDX-License-Identifier: EUPL-1.2
-->

<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
    <table class="w-full text-sm text-left">
      <caption class="sr-only">{{ caption }}</caption>
      <thead :class="{ 'sr-only': hideHeader }">
        <tr class="border-b border-gray-200 text-gray-600">
          <th scope="col" class="py-2 px-4 font-medium"><span class="sr-only">Inställning</span></th>
          <th v-for="column in columns" :key="column" scope="col" class="py-2 px-4 font-medium">{{ column }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.key" class="odd:bg-gray-50">
          <th scope="row" class="py-2 px-4 font-medium text-gray-600 whitespace-nowrap">{{ row.label }}</th>
          <td v-for="(value, i) in row.values" :key="columns[i]" class="py-2 px-4 font-mono text-gray-800 whitespace-nowrap">{{ value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
export interface ConfigTableRow {
  key: string
  label: string
  values: string[]
}

defineProps<{
  caption: string
  columns: string[]
  rows: ConfigTableRow[]
  hideHeader?: boolean
}>()
</script>
