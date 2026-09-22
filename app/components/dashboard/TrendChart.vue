<script setup lang="ts">
  import type { TrendPoint } from '~/types/dashboard'
  import { chartTextColor,
  chartGridColor, trendChartData } from '~/utils/dashboardChart'

  const props = defineProps<{ trend: (TrendPoint | null)[] }>()
  const { isDarkTheme } = useLayout()

  const chartData = computed(() => trendChartData(props.trend ?? []))
  const chartOptions = computed(() => {
    const color = chartTextColor(isDarkTheme.value)
    const gridColor = chartGridColor(isDarkTheme.value)
    return {
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: { labels: { color, usePointStyle: true, pointStyle: 'circle', padding: 16, boxWidth: 8 } },
      },
      scales: {
        x: { ticks: { color, autoSkip: false }, grid: { color: gridColor } },
        y: {
          beginAtZero: true,
          title: { display: true, text: '건', color },
          ticks: { color }, grid: { color: gridColor },
        },
        y1: {
          beginAtZero: true,
          suggestedMax: 10,
          position: 'right' as const,

          title: { display: true, text: '%', color },
          ticks: { color },
          grid: { drawOnChartArea: false },
        },
      },
    }
  })
</script>

<template>
  <div class="card mb-0 flex flex-col" :class="chartData && chartData.labels.length ? 'h-96' : ''">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-sm font-semibold">최근 {{ trend.length }}일 성공 · 실패 · 실패율</h3>
      <span class="text-surface-500 text-xs" v-if="trend.some((p) => p === null)"
        >빈 칸 = 아직 집계 전(갱신할 때마다 채워짐)</span
      >
    </div>
    <Chart class="min-h-0 flex-1" type="bar" :data="chartData" :options="chartOptions" />
  </div>
</template>
