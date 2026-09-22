<script setup lang="ts">
  const {
    workDate,
    days,
    data,
    loading,
    lastError,
    autoRefresh,
    refresh,
    generatedAgoSec,
  } = useDashboard()
  const { request } = useClientAPI()
  const confirm = useConfirm()
  const toast = useToast()
  const sending = ref(false)
  // 1초마다 갱신되는 generatedAgoSec 틱 때문에 매번 새 Date 를 만들지 않도록 한 번만 생성
  const today = new Date()

  const lockedCount = computed(() =>
    data.value?.lockedAccounts
      ? data.value.lockedAccounts.reduce(
          (n, c) => n + c.insurers.reduce((m, i) => m + i.second, 0),
          0,
        )
      : null,
  )

  const sendReport = () => {
    confirm.require({
      header: '텔레그램 보고 발송',
      message: `${formatToKoreanTime(workDate.value, 'YYYY-MM-DD')} 종합상황보고를 지금 보낼까요?`,
      icon: 'pi pi-send',
      acceptProps: { label: '발송' },
      rejectProps: { label: '취소', severity: 'secondary', outlined: true },
      accept: () => {
        sending.value = true
        request<{ sent: number; workDate: string }>(
          `/api/monitoring/daily-report?workDate=${formatToKoreanTime(workDate.value, 'YYYY-MM-DD')}`,
          { method: 'POST' },
        ).then(({ data: res, statusCode }) => {
          if (statusCode.value === 200) {
            toast.add({
              severity: 'success',
              summary: '성공',
              detail: `텔레그램 보고 발송 완료 (${res.value?.sent ?? 0}건)`,
              life: 3000,
            })
          } else {
            toast.add({
              severity: 'error',
              summary: '실패',
              detail: '텔레그램 보고 발송에 실패했습니다.',
              life: 5000,
            })
          }
          sending.value = false
        })
      },
    })
  }
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="card flex flex-wrap items-center gap-3">
      <h2 class="mr-auto text-lg font-semibold">RPA 대시보드</h2>
      <DatePicker
        class="w-40"
        v-model="workDate"
        date-format="yy-mm-dd"
        show-icon
        :max-date="today" />
      <Select class="w-24" v-model="days" :options="[7, 14, 30]" />
      <div class="text-surface-500 flex items-center gap-2 text-xs">
        <ToggleSwitch v-model="autoRefresh" />
        <span>60초 자동갱신</span>
        <span v-if="generatedAgoSec !== null"
          >· {{ generatedAgoSec }}초 전 집계<span v-if="data?.cached"> (캐시)</span></span
        >
        <span class="text-red-600" v-if="lastError">· {{ lastError }}</span>
      </div>
      <Button
        label="새로고침"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        :loading="loading"
        @click="refresh" />
      <Button
        label="텔레그램 발송"
        icon="pi pi-send"
        :loading="sending"
        @click="sendReport" />
    </div>

    <template v-if="data">
      <DashboardKpiTiles
        :totals="data.totals"
        :workers="data.workers"
        :locked-count="lockedCount" />
      <DashboardTrendChart :trend="data.trend" :days="days" />
      <DashboardBreakdownCharts
        :by-company="data.byCompany"
        :by-insurer="data.byInsurer"
        :totals="data.totals" />
      <DashboardIssueTables
        :workers="data.workers"
        :locked-accounts="data.lockedAccounts" />
    </template>
    <div class="card text-surface-500 text-sm" v-else-if="loading">불러오는 중…</div>
    <div class="card text-sm text-red-600" v-else-if="lastError">
      대시보드 {{ lastError }}
    </div>
    <div class="card text-surface-500 text-sm" v-else>표시할 데이터가 없습니다.</div>
  </div>
  <ConfirmDialog :pt="confirmPT" />
</template>
