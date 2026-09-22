<script setup lang="ts">
  import { categoryLabel } from '~/types/business-day-order'
  import { JobTypesEnum } from '~/types/enum'

  const { teams, insuranceCompanyCodes } = useGlobalData()
  const { request } = useClientAPI()
  const toast = useToast()

  interface PreviewRow {
    jobId: string
    insuranceCompanyCode: string | null
    jobType: string | null
    closingMonthNum: number | null
    category: string | null
    workTime: string | null
    startAfter: string | null
    priority: number | null
    skipped: boolean
    manual: boolean
  }

  interface PreviewResponse {
    companyId: string
    date: string
    businessDay: number
    enabled: boolean
    rows: PreviewRow[]
    skippedRows?: PreviewRow[]
    warnings?: string[]
  }

  const companyId = ref<string>('')
  const date = ref<Date>(new Date())
  const loading = ref(false)
  const result = ref<PreviewResponse | null>(null)

  const refineDate = computed(() => formatToKoreanTime(date.value, 'YYYY-MM-DD'))
  const insurerName = (code: string | null) =>
    insuranceCompanyCodes.value.find((c) => c.code === code)?.name ?? code ?? '-'
  const jobTypeLabel = (type: string | null) =>
    (type && JobTypesEnum[type as keyof typeof JobTypesEnum]) || type || '-'
  // 4카테고리(신계약/수금 × 전월/당월) 밖 작업은 category가 없으므로 작업구분으로 대신 표시
  const categoryOrJobType = (row: PreviewRow) =>
    row.category ? categoryLabel(row.category) : jobTypeLabel(row.jobType)

  type OrderedRow = PreviewRow & { executionOrder: number }
  // 서버 정렬(시작시각 → 우선순위)이 실제 실행순서. 표를 다른 컬럼으로 정렬해도 이 번호는 유지된다
  const orderedRows = computed<OrderedRow[]>(() =>
    (result.value?.rows ?? []).map((r, i) => ({ ...r, executionOrder: i + 1 })),
  )

  const preview = async () => {
    if (!companyId.value || !date.value) return
    loading.value = true
    try {
      const { data, statusCode } = await request<PreviewResponse & { message?: string }>(
        `/api/business-day-order/preview?companyId=${companyId.value}&date=${refineDate.value}`,
        { method: 'GET' },
        { updateDataOnError: true },
      )
      if (statusCode.value === 200) {
        result.value = data.value ?? null
      } else {
        result.value = null
        toast.add({
          severity: 'error',
          summary: '미리보기 조회 실패',
          detail: data.value?.message ?? '미리보기 조회에 실패했습니다.',
          life: 5000,
        })
      }
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <div class="flex flex-col gap-3">
    <div>
      <h2 class="text-2xl font-semibold">순서 미리보기 (시뮬레이션)</h2>
      <p class="text-surface-500">
        선택한 회사·날짜에 자동 생성될 작업과 그 실행 순서를 시뮬레이션합니다. 실제 작업은
        생성되지 않습니다.
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <Select
        v-model="companyId"
        :options="teams"
        option-label="name"
        option-value="id"
        placeholder="회사 선택"
        showClear />
      <DatePicker class="w-44" v-model="date" date-format="yy-mm-dd" show-icon />
      <Button
        label="미리보기"
        :loading="loading"
        :disabled="!companyId || !date"
        @click="preview" />
    </div>

    <template v-if="result">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-xl font-semibold"
          >{{ result.date }} = {{ result.businessDay }}영업일</span
        >
        <Tag
          :value="result.enabled ? '순서 사용' : '순서 미사용'"
          :severity="result.enabled ? 'success' : 'secondary'" />
        <span class="text-surface-500">
          생성 {{ result.rows.length }}건 · 스킵 {{ result.skippedRows?.length ?? 0 }}건
        </span>
      </div>

      <Message
        v-for="w in result.warnings ?? []"
        :key="w"
        severity="warn"
        :closable="false">
        {{ w }}
      </Message>

      <DataTable
        :value="orderedRows"
        data-key="jobId"
        show-gridlines
        striped-rows
        sort-field="executionOrder"
        :sort-order="1"
        removable-sort>
        <template #empty>생성될 작업이 없습니다.</template>
        <Column
          class="w-20 text-center"
          field="executionOrder"
          header="실행순서"
          sortable />
        <Column header="보험사">
          <template #body="{ data }">{{
            insurerName(data.insuranceCompanyCode)
          }}</template>
        </Column>
        <Column class="text-center" header="카테고리">
          <template #body="{ data }">{{ categoryOrJobType(data) }}</template>
        </Column>
        <Column class="text-center" field="startAfter" header="시작시각" sortable>
          <template #body="{ data }">{{
            data.startAfter ?? data.workTime ?? '-'
          }}</template>
        </Column>
        <Column class="text-right" field="priority" header="우선순위" sortable></Column>
        <Column class="w-20 text-center" header="수동">
          <template #body="{ data }">
            <Tag v-if="data.manual" value="수동" severity="warn" />
          </template>
        </Column>
      </DataTable>
    </template>
  </div>
</template>
