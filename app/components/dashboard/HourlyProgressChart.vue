<script setup lang="ts">
  import type { HourlyPoint } from '~/types/dashboard'
  import { 
  CHART_FONT,chartTextColor,
  chartGridColor, hourlyProgressData } from '~/utils/dashboardChart'

  const props = defineProps<{
    hourly: HourlyPoint[] | null
    dayTotal: number | null
  }>()
  const { isDarkTheme } = useLayout()

  const chartData = computed(() =>
    props.hourly ? hourlyProgressData(props.hourly, props.dayTotal) : null,
  )

  const chartOptions = computed(() => {
    const color = chartTextColor(isDarkTheme.value)
    const gridColor = chartGridColor(isDarkTheme.value)
    return {
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: { labels: {
            color,
            font: CHART_FONT,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            boxWidth: 8,
          } },
      },
      scales: {
        x: { ticks: { color, font: CHART_FONT }, grid: { color: gridColor } },
        y: {
          stacked: true,
          beginAtZero: true,
          title: { display: true, text: '건', color, font: CHART_FONT },
          ticks: { color, font: CHART_FONT }, grid: { color: gridColor },
        },
        y1: {
          beginAtZero: true,
          position: 'right' as const,

          title: { display: true, text: '잔량', color, font: CHART_FONT },
          ticks: { color, font: CHART_FONT },
          grid: { drawOnChartArea: false },
        },
      },
    }
  })
</script>

<template>
  <div class="card !mb-0 flex flex-col" :class="chartData && chartData.labels.length ? 'h-80' : ''">
    <h3 class="mb-2 text-sm font-semibold">시간대별 처리량 · 미완료 잔량</h3>
    <Chart
      class="min-h-0 flex-1"
      v-if="chartData && chartData.labels.length"
      type="bar"
      :data="chartData"
      :options="chartOptions" />
    <p class="text-surface-500 text-sm" v-else-if="chartData">완료된 작업 없음</p>
    <p class="text-surface-500 text-sm" v-else>(조회 실패)</p>
  </div>
</template>
