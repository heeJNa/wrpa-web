<script setup lang="ts">
  import type { FailureReasonStat } from '~/types/dashboard'
  import {
    CHART_FONT,
    chartGridColor,
    chartTextColor,
    failureReasonData,
  } from '~/utils/dashboardChart'

  const props = defineProps<{
    failureReasons: FailureReasonStat[] | null
  }>()
  const { isDarkTheme } = useLayout()

  const reasons = computed(() =>
    props.failureReasons ? failureReasonData(props.failureReasons, isDarkTheme.value) : null,
  )

  const options = computed(() => {
    const color = chartTextColor(isDarkTheme.value)
    const gridColor = chartGridColor(isDarkTheme.value)
    return {
      maintainAspectRatio: false,
      indexAxis: 'y' as const,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, ticks: { color, font: CHART_FONT }, grid: { color: gridColor } },
        // autoSkip 을 끄지 않으면 chart.js 가 카드 폭에 맞춰 사유 이름을 건너뛴다 —
        // 이름 없는 막대는 쓸모가 없으므로 전부 그린다.
        y: { ticks: { color, autoSkip: false, font: CHART_FONT }, grid: { display: false } },
      },
    }
  })
</script>

<template>
  <div class="card !mb-0 flex flex-col" :class="reasons && reasons.labels.length ? 'h-96' : ''">
    <h3 class="mb-2 text-sm font-semibold">실패 사유</h3>
    <Chart
      class="min-h-0 flex-1"
      v-if="reasons && reasons.labels.length"
      type="bar"
      :data="reasons"
      :options="options" />
    <p class="text-surface-500 text-sm" v-else-if="reasons">실패 없음</p>
    <p class="text-surface-500 text-sm" v-else>(조회 실패)</p>
  </div>
</template>
