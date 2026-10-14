<!--
SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
SPDX-License-Identifier: EUPL-1.2
-->

<template>
  <div>
    <h3 class="m-0">
      <button
        :id="buttonId"
        type="button"
        :aria-expanded="open"
        :aria-controls="panelId"
        :class="buttonClass"
        class="w-full flex items-center justify-between text-sm font-medium py-2 border-t border-gray-200 transition-colors rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
        @click="open = !open"
      >
        <span>{{ title }}</span>
        <svg
          class="w-4 h-4 transition-transform duration-200 motion-reduce:transition-none"
          :class="{ 'rotate-180': open }"
          aria-hidden="true"
          focusable="false"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    </h3>
    <div
      v-show="open"
      :id="panelId"
      role="region"
      :aria-labelledby="buttonId"
      class="mt-2"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title: string; buttonClass?: string }>(), {
  buttonClass: 'text-gray-600 hover:text-gray-800',
})

const open = ref(false)
const id = useId()
const buttonId = `accordion-button-${id}`
const panelId = `accordion-panel-${id}`
</script>
