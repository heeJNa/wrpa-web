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
  const closingLabel = (n: number | null) =>
    n == null ? '-' : n < 0 ? `전월(${n})` : n === 0 ? '당월' : `+${n}`

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
  <div class="flex flex-col gap-4 p-4">
    <div>
      <h2 class="text-xl font-semibold">순서 미리보기 (시뮬레이션)</h2>
      <p class="text-surface-500 text-sm">
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
        <span class="font-medium"
          >{{ result.date }} = {{ result.businessDay }}영업일</span
        >
        <Tag
          :value="result.enabled ? '순서 사용' : '순서 미사용'"
          :severity="result.enabled ? 'success' : 'secondary'" />
        <span class="text-surface-500 text-sm">
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
        :value="result.rows"
        data-key="jobId"
        size="small"
        show-gridlines
        striped-rows>
        <template #empty>생성될 작업이 없습니다.</template>
        <Column class="w-20 text-center" header="실행순서">
          <template #body="{ index }">{{ index + 1 }}</template>
        </Column>
        <Column header="보험사">
          <template #body="{ data }">{{
            insurerName(data.insuranceCompanyCode)
          }}</template>
        </Column>
        <Column class="text-center" header="작업구분">
          <template #body="{ data }">{{ jobTypeLabel(data.jobType) }}</template>
        </Column>
        <Column class="text-center" header="업적월">
          <template #body="{ data }">{{ closingLabel(data.closingMonthNum) }}</template>
        </Column>
        <Column class="text-center" header="카테고리">
          <template #body="{ data }">{{ categoryLabel(data.category) }}</template>
        </Column>
        <Column class="text-center" header="시작시각">
          <template #body="{ data }">{{
            data.startAfter ?? data.workTime ?? '-'
          }}</template>
        </Column>
        <Column class="text-right" field="priority" header="우선순위"></Column>
        <Column class="w-20 text-center" header="수동">
          <template #body="{ data }">
            <Tag v-if="data.manual" value="수동" severity="warn" />
          </template>
        </Column>
      </DataTable>

      <template v-if="result.skippedRows?.length">
        <h3 class="mt-2 font-medium">생성되지 않는 작업 (유효 영업일 범위 밖)</h3>
        <DataTable
          :value="result.skippedRows"
          data-key="jobId"
          size="small"
          show-gridlines
          striped-rows>
          <Column header="보험사">
            <template #body="{ data }">{{
              insurerName(data.insuranceCompanyCode)
            }}</template>
          </Column>
          <Column class="text-center" header="작업구분">
            <template #body="{ data }">{{ jobTypeLabel(data.jobType) }}</template>
          </Column>
          <Column class="text-center" header="업적월">
            <template #body="{ data }">{{ closingLabel(data.closingMonthNum) }}</template>
          </Column>
          <Column class="text-center" header="카테고리">
            <template #body="{ data }">{{ categoryLabel(data.category) }}</template>
          </Column>
          <Column class="text-center" field="workTime" header="작업시각"></Column>
        </DataTable>
      </template>
    </template>
  </div>
</template>
