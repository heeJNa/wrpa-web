<script setup lang="ts">
  import type { HourlyPoint } from '~/types/dashboard'
  import { chartTextColor, hourlyProgressData } from '~/utils/dashboardChart'

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
    return {
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: { legend: { labels: { color } } },
      scales: {
        x: { ticks: { color } },
        y: {
          stacked: true,
          beginAtZero: true,
          title: { display: true, text: '건', color },
          ticks: { color },
        },
        y1: {
          beginAtZero: true,
          position: 'right' as const,
          grid: { drawOnChartArea: false },
          title: { display: true, text: '잔량', color },
          ticks: { color },
        },
      },
    }
  })
</script>

<template>
  <div class="card flex h-80 flex-col">
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
