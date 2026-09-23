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
        // 텔레그램 종합상황보고의 작업자 줄과 같은 숫자·같은 문구로 읽히게 한다 —
        // 총 대수와 '미설정 제외'가 빠지면 보고서와 대조할 때 암산이 필요하다.
        label: '작업자',
        value: w ? `${w.total}대` : null,
        sub: w
          ? `대기 ${w.idle} · 작업중 ${w.busy} · 응답없음 ${w.unhealthy.length}` +
            (w.ignored ? ` · 미설정 ${w.ignored}대 제외` : '')
          : '',
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
      class="border-surface-100 bg-surface-0 dark:border-surface-800 dark:bg-surface-900 rounded-xl border px-3 py-3 sm:px-4 sm:py-3.5"
      v-for="tile in tiles"
      :key="tile.label">
      <div class="text-surface-500 text-[13px] font-medium">{{ tile.label }}</div>
      <div
        class="text-surface-800 dark:text-surface-100 mt-1.5 text-[1.35rem] leading-none font-semibold tracking-tight sm:text-[1.6rem]"
        :class="{
          'text-[#5f9b80] dark:text-[#7fba9c]': tile.tone === 'success',
          'text-[#dc2626] dark:text-[#f87171]': tile.tone === 'danger',
          'text-[#c08f45] dark:text-[#d8a75c]': tile.tone === 'warn',
        }">
        {{ tile.value ?? '(조회 실패)' }}
      </div>
      <div class="text-surface-500 mt-2 text-[12px] leading-relaxed" v-if="tile.sub">{{ tile.sub }}</div>
    </div>
  </div>
</template>
