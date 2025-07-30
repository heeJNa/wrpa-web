<script setup lang="ts">
  const {
    error,
    label,
    required,
    horizontal = false,
  } = defineProps<{
    error?: string[]
    label?: string
    required?: boolean
    horizontal?: boolean
  }>()
</script>
<template>
  <div
    :class="{
      flex: true,
      'flex-col': !horizontal,
      'items-center gap-2': horizontal,
    }">
    <label class="block font-semibold" v-if="label"
      ><span class="mr-1 text-sm text-red-500" v-if="required">*</span>{{ label }}</label
    >
    <slot name="input"></slot>
    <small class="p-error" v-if="error">{{ error[0] }}</small>
  </div>
</template>
<style lang="scss" module></style>
