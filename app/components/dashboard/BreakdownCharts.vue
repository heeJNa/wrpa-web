<script setup lang="ts">
  import type { CompanyStat, InsurerStat, StateCounts } from '~/types/dashboard'
  import {
    companyChartData,
    insurerFailRateData,
    stateDonutData,
  } from '~/utils/dashboardChart'

  const props = defineProps<{
    byCompany: CompanyStat[] | null
    byInsurer: InsurerStat[] | null
    totals: StateCounts | null
  }>()

  const company = computed(() =>
    props.byCompany ? companyChartData(props.byCompany) : null,
  )
  const insurer = computed(() =>
    props.byInsurer ? insurerFailRateData(props.byInsurer, 10) : null,
  )
  const donut = computed(() => (props.totals ? stateDonutData(props.totals) : null))

  const stacked = {
    maintainAspectRatio: false,
    scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
  }
  const horizontal = {
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    scales: { x: { beginAtZero: true, max: 100, title: { display: true, text: '%' } } },
  }
  const donutOptions = { maintainAspectRatio: false, cutout: '60%' }
</script>

<template>
  <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
    <div class="card h-80">
      <h3 class="mb-2 text-sm font-semibold">회사별 성공 / 실패</h3>
      <Chart
        class="h-64"
        v-if="company && company.labels.length"
        type="bar"
        :data="company"
        :options="stacked" />
      <p class="text-surface-500 text-sm" v-else-if="company">작업 없음</p>
      <p class="text-surface-500 text-sm" v-else>(조회 실패)</p>
    </div>
    <div class="card h-80">
      <h3 class="mb-2 text-sm font-semibold">보험사별 실패율 상위 10</h3>
      <Chart
        class="h-64"
        v-if="insurer && insurer.labels.length"
        type="bar"
        :data="insurer"
        :options="horizontal" />
      <p class="text-surface-500 text-sm" v-else-if="insurer">실패 없음</p>
      <p class="text-surface-500 text-sm" v-else>(조회 실패)</p>
    </div>
    <div class="card h-80">
      <h3 class="mb-2 text-sm font-semibold">오늘 상태 분포</h3>
      <Chart
        class="h-64"
        v-if="donut && donut.labels.length"
        type="doughnut"
        :data="donut"
        :options="donutOptions" />
      <p class="text-surface-500 text-sm" v-else-if="donut">작업 없음</p>
      <p class="text-surface-500 text-sm" v-else>(조회 실패)</p>
    </div>
  </div>
</template>
