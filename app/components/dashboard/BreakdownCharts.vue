<script setup lang="ts">
  import type { CompanyStat, InsurerStat, StateCounts } from '~/types/dashboard'
  import {
    chartTextColor,
    companyChartData,
    insurerFailRateData,
    stateDonutData,
  } from '~/utils/dashboardChart'

  const props = defineProps<{
    byCompany: CompanyStat[] | null
    byInsurer: InsurerStat[] | null
    totals: StateCounts | null
  }>()
  const { isDarkTheme } = useLayout()

  const company = computed(() =>
    props.byCompany ? companyChartData(props.byCompany) : null,
  )
  const insurer = computed(() =>
    props.byInsurer ? insurerFailRateData(props.byInsurer, 10) : null,
  )
  const donut = computed(() => (props.totals ? stateDonutData(props.totals) : null))

  const stacked = computed(() => {
    const color = chartTextColor(isDarkTheme.value)
    return {
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color } } },
      scales: {
        x: { stacked: true, ticks: { color, autoSkip: false } },
        y: { stacked: true, beginAtZero: true, ticks: { color } },
      },
    }
  })
  const horizontal = computed(() => {
    const color = chartTextColor(isDarkTheme.value)
    return {
      maintainAspectRatio: false,
      indexAxis: 'y' as const,
      plugins: { legend: { labels: { color } } },
      scales: {
        x: {
          beginAtZero: true,
          suggestedMax: 10,
          title: { display: true, text: '%', color },
          ticks: { color },
        },
        // autoSkip 을 끄지 않으면 chart.js 가 카드 폭에 맞춰 보험사 이름을 건너뛴다 —
        // 순위 차트에서 이름 없는 막대는 쓸모가 없으므로 전부 그린다.
        y: { ticks: { color, autoSkip: false } },
      },
    }
  })
  const donutOptions = computed(() => ({
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: { legend: { labels: { color: chartTextColor(isDarkTheme.value) } } },
  }))
</script>

<template>
  <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
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
      <h3 class="mb-2 text-sm font-semibold">보험사별 실패율 상위 10</h3>
      <Chart
        class="min-h-0 flex-1"
        v-if="insurer && insurer.labels.length"
        type="bar"
        :data="insurer"
        :options="horizontal" />
      <p class="text-surface-500 text-sm" v-else-if="insurer">집계할 작업 없음</p>
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
