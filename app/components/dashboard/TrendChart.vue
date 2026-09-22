<script setup lang="ts">
  import type { TrendPoint } from '~/types/dashboard'
  import { trendChartData } from '~/utils/dashboardChart'

  const props = defineProps<{ trend: (TrendPoint | null)[]; days: number }>()

  const chartData = computed(() => trendChartData(props.trend))
  const chartOptions = {
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: '건' } },
      y1: {
        beginAtZero: true,
        max: 100,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        title: { display: true, text: '%' },
      },
    },
  }
</script>

<template>
  <div class="card h-80">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-sm font-semibold">최근 {{ days }}일 처리량 · 실패율</h3>
      <span class="text-surface-500 text-xs" v-if="trend.some((p) => p === null)"
        >빈 칸 = 집계 실패(다음 갱신에 재시도)</span
      >
    </div>
    <Chart class="h-64" type="bar" :data="chartData" :options="chartOptions" />
  </div>
</template>
