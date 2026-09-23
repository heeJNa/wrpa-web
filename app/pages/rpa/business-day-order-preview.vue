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
  // 업적월은 당월 기준 오프셋(0=당월, -1=전월). 4카테고리 밖 작업(수수료 등)은 category가 없다
  const closingMonthLabel = (n: number | null) =>
    n === null
      ? '-'
      : n === 0
        ? '당월'
        : n === -1
          ? '전월'
          : `${n > 0 ? '+' : ''}${n}개월`

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
  <div class="flex h-full flex-col gap-3 overflow-hidden">
    <div class="card !mb-0 !p-4">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold sm:text-2xl">순서 미리보기 (시뮬레이션)</h2>
          <p class="text-surface-500">
            선택한 회사·날짜에 자동 생성될 작업과 그 실행 순서를 시뮬레이션합니다. 실제
            작업은 생성되지 않습니다.
          </p>
        </div>
        <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Select
            class="w-full sm:w-56"
            v-model="companyId"
            :options="teams"
            option-label="name"
            option-value="id"
            placeholder="회사 선택"
            showClear
            filter />
          <DatePicker
            class="w-full sm:w-48"
            v-model="date"
            date-format="yy-mm-dd"
            show-icon />
          <Button
            class="w-full sm:w-auto"
            label="미리보기"
            icon="pi pi-search"
            :loading="loading"
            :disabled="!companyId || !date"
            @click="preview" />
        </div>
      </div>
    </div>

    <div class="card !mb-0 flex min-h-0 flex-1 flex-col gap-3 !p-4" v-if="result">
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
        class="p-datatable-mobile-cards min-h-0 flex-1"
        :pt="{ column: mobileCardColumnPT }"
        :value="orderedRows"
        data-key="jobId"
        scrollable
        scroll-height="flex"
        show-gridlines
        striped-rows
        row-hover
        sort-field="executionOrder"
        :sort-order="1"
        removable-sort>
        <template #empty>생성될 작업이 없습니다.</template>
        <Column
          class="w-28 text-center whitespace-nowrap"
          field="executionOrder"
          header="실행순서"
          sortable />
        <Column header="보험사">
          <template #body="{ data }">{{
            insurerName(data.insuranceCompanyCode)
          }}</template>
        </Column>
        <Column class="w-32 text-center whitespace-nowrap" header="작업구분">
          <template #body="{ data }">{{ jobTypeLabel(data.jobType) }}</template>
        </Column>
        <Column class="w-28 text-center whitespace-nowrap" header="업적월">
          <template #body="{ data }">{{
            closingMonthLabel(data.closingMonthNum)
          }}</template>
        </Column>
        <Column class="text-center" header="카테고리">
          <template #body="{ data }">{{
            data.category ? categoryLabel(data.category) : '-'
          }}</template>
        </Column>
        <Column
          class="w-48 text-center whitespace-nowrap"
          field="startAfter"
          header="시작시각"
          sortable>
          <template #body="{ data }">{{
            data.startAfter ?? data.workTime ?? '-'
          }}</template>
        </Column>
        <Column
          class="w-28 text-center whitespace-nowrap"
          field="priority"
          header="우선순위"
          sortable />
        <Column class="w-20 text-center" header="수동">
          <template #body="{ data }">
            <Tag v-if="data.manual" value="수동" severity="warn" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
