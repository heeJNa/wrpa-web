<script setup lang="ts">
  import type { StateCounts, WorkerSummary } from '~/types/dashboard'
  import { percent } from '~/utils/dashboardChart'

  const props = defineProps<{
    totals: StateCounts | null
    workers: WorkerSummary | null
    lockedCount: number | null
  }>()

  const tiles = computed(() => {
    const t = props.totals
    const w = props.workers
    return [
      { label: '총건', value: t ? t.total : null, sub: '' },
      { label: '성공', value: t ? t.success : null, sub: '', tone: 'success' },
      {
        label: '실패',
        value: t ? t.fail : null,
        sub: t ? `실패율 ${percent(t.failRate)}` : '',
        tone: 'danger',
      },
      {
        label: '대기 / 작업중',
        value: t ? `${t.waiting} / ${t.working}` : null,
        sub: t && t.cancel ? `취소 ${t.cancel}` : '',
      },
      {
        label: '작업자',
        value: w ? `${w.idle} / ${w.busy}` : null,
        sub: w ? `대기 / 작업중 · 응답없음 ${w.unhealthy.length}` : '',
        tone: w && w.unhealthy.length ? 'danger' : undefined,
      },
      {
        label: '잠긴 계정',
        value: props.lockedCount,
        sub: '',
        tone: props.lockedCount ? 'warn' : undefined,
      },
    ]
  })
</script>

<template>
  <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
    <div
      class="border-surface-200 bg-surface-0 dark:border-surface-700 dark:bg-surface-900 rounded-lg border p-3"
      v-for="tile in tiles"
      :key="tile.label">
      <div class="text-surface-500 text-xs">{{ tile.label }}</div>
      <div
        class="mt-1 text-2xl font-semibold"
        :class="{
          'text-green-600': tile.tone === 'success',
          'text-red-600': tile.tone === 'danger',
          'text-amber-600': tile.tone === 'warn',
        }">
        {{ tile.value ?? '(조회 실패)' }}
      </div>
      <div class="text-surface-500 mt-1 text-xs" v-if="tile.sub">{{ tile.sub }}</div>
    </div>
  </div>
</template>
