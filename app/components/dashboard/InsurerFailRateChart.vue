<script setup lang="ts">
  import type { InsurerStat } from '~/types/dashboard'
  import { chartTextColor,
  chartGridColor, insurerFailRateData } from '~/utils/dashboardChart'

  const props = defineProps<{
    byInsurer: InsurerStat[] | null
  }>()
  const { isDarkTheme } = useLayout()

  const insurer = computed(() =>
    props.byInsurer ? insurerFailRateData(props.byInsurer, 10) : null,
  )

  const options = computed(() => {
    const color = chartTextColor(isDarkTheme.value)
    const gridColor = chartGridColor(isDarkTheme.value)
    return {
      maintainAspectRatio: false,
      indexAxis: 'y' as const,
      plugins: {
        legend: { labels: { color, usePointStyle: true, pointStyle: 'circle', padding: 16, boxWidth: 8 } },
      },
      scales: {
        x: {
          beginAtZero: true,
          suggestedMax: 10,
          title: { display: true, text: '%', color },
          ticks: { color }, grid: { color: gridColor },
        },
        // autoSkip 을 끄지 않으면 chart.js 가 카드 폭에 맞춰 보험사 이름을 건너뛴다 —
        // 순위 차트에서 이름 없는 막대는 쓸모가 없으므로 전부 그린다.
        y: { ticks: { color, autoSkip: false }, grid: { display: false } },
      },
    }
  })
</script>

<template>
  <div class="card mb-0 flex flex-col" :class="insurer && insurer.labels.length ? 'h-96' : ''">
    <h3 class="mb-2 text-sm font-semibold">보험사별 실패율 상위 10</h3>
    <Chart
      class="min-h-0 flex-1"
      v-if="insurer && insurer.labels.length"
      type="bar"
      :data="insurer"
      :options="options" />
    <p class="text-surface-500 text-sm" v-else-if="insurer">실패 없음</p>
    <p class="text-surface-500 text-sm" v-else>(조회 실패)</p>
  </div>
</template>
