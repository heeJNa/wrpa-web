<script setup lang="ts">
  import type { CompanyLockedSummary, WorkerSummary } from '~/types/dashboard'

  const props = defineProps<{
    workers: WorkerSummary | null
    lockedAccounts: CompanyLockedSummary[] | null
  }>()

  const unhealthyRows = computed(
    () => props.workers?.unhealthy.map((name) => ({ name })) ?? [],
  )
  // 대부분 1건이라 '건수' 열은 숫자 하나를 위해 한 칸을 쓴다. 텔레그램 보고와 같은
  // 표기로 2건 이상일 때만 보험사명 뒤에 붙인다.
  const lockedRows = computed(
    () =>
      props.lockedAccounts?.flatMap((c) =>
        c.insurers.map((i) => ({
          company: c.companyName,
          insurer: i.second > 1 ? `${i.first} (${i.second})` : i.first,
        })),
      ) ?? [],
  )
</script>

<template>
  <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
    <div class="card mb-0">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-semibold">응답 없는 작업자 (현재)</h3>
        <NuxtLink class="text-primary text-xs" to="/rpa/workers">작업자 관리 →</NuxtLink>
      </div>
      <p class="text-surface-500 text-sm" v-if="!workers">(조회 실패)</p>
      <p class="text-surface-500 text-sm" v-else-if="!unhealthyRows.length">모두 정상</p>
      <DataTable v-else :value="unhealthyRows" size="small">
        <Column field="name" header="작업자" />
      </DataTable>
    </div>
    <div class="card mb-0">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-semibold">잠긴 계정 (현재)</h3>
        <NuxtLink class="text-primary text-xs" to="/management/accounts"
          >계정 관리 →</NuxtLink
        >
      </div>
      <p class="text-surface-500 text-sm" v-if="!lockedAccounts">(조회 실패)</p>
      <p class="text-surface-500 text-sm" v-else-if="!lockedRows.length">없음</p>
      <DataTable v-else :value="lockedRows" size="small">
        <Column field="company" header="회사" />
        <Column field="insurer" header="보험사" />
      </DataTable>
    </div>
  </div>
</template>
