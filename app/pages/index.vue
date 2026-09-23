<script setup lang="ts">
  const { workDate, data, loading, lastError, refresh, generatedAt } = useDashboard()
  const { sending, send: sendReport } = useDailyReport()
  const today = new Date()

  const lockedCount = computed(() =>
    data.value?.lockedAccounts
      ? data.value.lockedAccounts.reduce(
          (n, c) => n + c.insurers.reduce((m, i) => m + i.second, 0),
          0,
        )
      : null,
  )

</script>

<template>
  <div class="flex flex-col gap-5 pb-10">
    <div class="card !mb-0 flex flex-wrap items-center gap-x-4 gap-y-3">
      <h2 class="text-lg font-semibold">RPA 대시보드</h2>
      <div class="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
        <label class="text-surface-500 shrink-0 text-sm" for="dashboard-work-date"
          >기준일</label
        >
        <DatePicker
          class="w-full sm:w-44"
          input-id="dashboard-work-date"
          v-model="workDate"
          date-format="yy-mm-dd"
          show-icon
          :max-date="today" />
      </div>
      <!-- 좁은 화면에서는 집계 시각이 버튼을 밀어내지 않도록 맨 아래 한 줄로 내린다 -->
      <div
        class="text-surface-400 order-last w-full text-xs sm:order-none sm:mr-auto sm:w-auto">
        <span v-if="generatedAt">{{ generatedAt }} 집계</span>
        <span class="text-red-500" v-if="lastError">{{ lastError }}</span>
      </div>
      <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <Button
          class="flex-1 sm:flex-none"
          label="새로고침"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          :loading="loading"
          @click="refresh" />
        <Button
          class="flex-1 sm:flex-none"
          label="텔레그램 발송"
          icon="pi pi-send"
          :loading="sending"
          @click="sendReport(formatToKoreanTime(workDate, 'YYYY-MM-DD'))" />
      </div>
    </div>

    <template v-if="data">
      <!-- 오늘 요약 → 지금 돌고 있나 → 왜·어디서 → 지금 조치할 것 → 책임 구분·추세 -->
      <DashboardKpiTiles
        :totals="data.totals"
        :workers="data.workers"
        :locked-count="lockedCount" />
      <!-- 취소된 작업은 끝나기를 기다리는 물량이 아니므로 잔량 분모에서 뺀다 -->
      <DashboardHourlyProgressChart
        :hourly="data.hourly"
        :day-total="data.totals ? data.totals.total - data.totals.cancel : null" />
      <div class="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-3">
        <DashboardFailureReasonChart :failure-reasons="data.failureReasons" />
        <DashboardWorkerChart :by-worker="data.byWorker" />
        <DashboardInsurerFailRateChart :by-insurer="data.byInsurer" />
      </div>
      <DashboardIssueTables
        :workers="data.workers"
        :locked-accounts="data.lockedAccounts" />
      <div class="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-2">
        <DashboardCompanyChart :by-company="data.byCompany" />
        <DashboardTrendChart :trend="data.trend" />
      </div>
    </template>
    <div class="card text-surface-500 text-sm" v-else-if="loading">불러오는 중…</div>
    <div class="card text-sm text-red-600" v-else-if="lastError">
      대시보드 {{ lastError }}
    </div>
    <div class="card text-surface-500 text-sm" v-else>표시할 데이터가 없습니다.</div>
  </div>
  <ConfirmDialog :pt="confirmPT" />
</template>
