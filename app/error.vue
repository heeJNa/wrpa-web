<script setup lang="ts">
  import type { NuxtError } from '#app'
  // definePageMeta({
  //   layout: false,
  // })
  const { error } = defineProps({
    error: Object as () => NuxtError,
  })
</script>

<template>
  <NotFound v-if="error?.statusCode === 404" />
  <FatalError v-else-if="error" />
</template>

<style scoped lang="scss"></style>
