<script setup lang="ts">
  import type { CompanyStat } from '~/types/dashboard'
  import {
    chartGridColor,
    chartTextColor,
    companyChartData,
  } from '~/utils/dashboardChart'

  const props = defineProps<{ byCompany: CompanyStat[] | null }>()
  const { isDarkTheme } = useLayout()

  const company = computed(() =>
    props.byCompany ? companyChartData(props.byCompany) : null,
  )

  const options = computed(() => {
    const color = chartTextColor(isDarkTheme.value)
    const gridColor = chartGridColor(isDarkTheme.value)
    return {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            boxWidth: 8,
          },
        },
      },
      // 회사 수가 적어도 허전해 보이지 않고, 작업자·보험사 차트와 읽는 방향이 같도록 가로 막대로 둔다
      indexAxis: 'y' as const,
      scales: {
        x: {
          stacked: true,
          beginAtZero: true,
          ticks: { color },
          grid: { color: gridColor },
        },
        y: { stacked: true, ticks: { color, autoSkip: false }, grid: { display: false } },
      },
    }
  })
</script>

<template>
  <div
    class="card !mb-0 flex flex-col"
    :class="company && company.labels.length ? 'h-96' : ''">
    <h3 class="mb-2 text-sm font-semibold">회사별 성공 / 실패</h3>
    <Chart
      class="min-h-0 flex-1"
      v-if="company && company.labels.length"
      type="bar"
      :data="company"
      :options="options" />
    <p class="text-surface-500 text-sm" v-else-if="company">작업 없음</p>
    <p class="text-surface-500 text-sm" v-else>(조회 실패)</p>
  </div>
</template>
