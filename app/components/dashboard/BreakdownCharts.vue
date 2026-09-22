<script setup lang="ts">
  import type { CompanyStat, StateCounts } from '~/types/dashboard'
  import {
    chartTextColor,
  chartGridColor,
    companyChartData,
    stateDonutData,
  } from '~/utils/dashboardChart'

  const props = defineProps<{
    byCompany: CompanyStat[] | null
    totals: StateCounts | null
  }>()
  const { isDarkTheme } = useLayout()

  const company = computed(() =>
    props.byCompany ? companyChartData(props.byCompany) : null,
  )
  const donut = computed(() => (props.totals ? stateDonutData(props.totals) : null))

  const stacked = computed(() => {
    const color = chartTextColor(isDarkTheme.value)
    const gridColor = chartGridColor(isDarkTheme.value)
    return {
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color, usePointStyle: true, pointStyle: 'circle', padding: 16, boxWidth: 8 } },
      },
      // 회사 수가 적어도 허전해 보이지 않고, 옆의 작업자·보험사 차트와 읽는 방향이 같도록 가로 막대로 둔다
      indexAxis: 'y' as const,
      scales: {
        x: { stacked: true, beginAtZero: true, ticks: { color }, grid: { color: gridColor } },
        y: { stacked: true, ticks: { color, autoSkip: false }, grid: { display: false } },
      },
    }
  })
  const donutOptions = computed(() => ({
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        labels: {
          color: chartTextColor(isDarkTheme.value),
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          boxWidth: 8,
        },
      },
    },
  }))
</script>

<template>
  <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
    <div class="card mb-0 flex h-96 flex-col">
      <h3 class="mb-2 text-sm font-semibold">회사별 성공 / 실패</h3>
      <Chart
        class="min-h-0 flex-1"
        v-if="company && company.labels.length"
        type="bar"
        :data="company"
        :options="stacked" />
      <p class="text-surface-500 text-sm" v-else-if="company">작업 없음</p>
      <p class="text-surface-500 text-sm" v-else>(조회 실패)</p>
    </div>
    <div class="card mb-0 flex h-96 flex-col">
      <h3 class="mb-2 text-sm font-semibold">상태 분포</h3>
      <Chart
        class="min-h-0 flex-1"
        v-if="donut && donut.labels.length"
        type="doughnut"
        :data="donut"
        :options="donutOptions" />
      <p class="text-surface-500 text-sm" v-else-if="donut">작업 없음</p>
      <p class="text-surface-500 text-sm" v-else>(조회 실패)</p>
    </div>
  </div>
</template>
