<script setup lang="ts">
  import type { TrendPoint } from '~/types/dashboard'
  import { chartTextColor, trendChartData } from '~/utils/dashboardChart'

  const props = defineProps<{ trend: (TrendPoint | null)[]; days: number }>()
  const { isDarkTheme } = useLayout()

  const chartData = computed(() => trendChartData(props.trend ?? []))
  const chartOptions = computed(() => {
    const color = chartTextColor(isDarkTheme.value)
    return {
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: { legend: { labels: { color } } },
      scales: {
        x: { ticks: { color } },
        y: {
          beginAtZero: true,
          title: { display: true, text: '건', color },
          ticks: { color },
        },
        y1: {
          beginAtZero: true,
          suggestedMax: 10,
          position: 'right' as const,
          grid: { drawOnChartArea: false },
          title: { display: true, text: '%', color },
          ticks: { color },
        },
      },
    }
  })
</script>

<template>
  <div class="card flex h-80 flex-col">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-sm font-semibold">최근 {{ trend.length }}일 처리량 · 실패율</h3>
      <span class="text-surface-500 text-xs" v-if="trend.some((p) => p === null)"
        >빈 칸 = 집계 실패(다음 갱신에 재시도)</span
      >
    </div>
    <Chart class="min-h-0 flex-1" type="bar" :data="chartData" :options="chartOptions" />
  </div>
</template>
