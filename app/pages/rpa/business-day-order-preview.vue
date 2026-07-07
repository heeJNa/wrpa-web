<script setup lang="ts">
  import { categoryLabel } from '~/types/business-day-order'

  const { teams } = useGlobalData()
  const { request } = useClientAPI()
  const toast = useToast()

  interface PreviewRow {
    jobId: string
    insuranceCompanyCode: string
    jobType: string
    closingMonthNum: number
    category: string
    workTime: string
    startAfter: string
    priority: number
    skipped: boolean
    manual: boolean
  }

  interface PreviewResponse {
    companyId: string
    date: string
    businessDay: number
    enabled: boolean
    rows: PreviewRow[]
  }

  const companyId = ref<string>('')
  const date = ref<string>(new Date().toISOString().slice(0, 10))
  const loading = ref(false)
  const result = ref<PreviewResponse | null>(null)

  const preview = async () => {
    if (!companyId.value || !date.value) return
    loading.value = true
    try {
      const { data, statusCode } = await request<PreviewResponse>(
        `/api/business-day-order/preview?companyId=${companyId.value}&date=${date.value}`,
        {
          method: 'GET',
        },
      )
      if (statusCode.value === 200) {
        result.value = data.value ?? null
      } else {
        toast.add({
          severity: 'error',
          summary: '오류',
          detail: '미리보기 조회에 실패했습니다.',
          life: 3000,
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
        선택한 회사/날짜 기준으로 영업일 순서 정책이 적용된 작업 실행 순서를
        시뮬레이션합니다.
      </p>
    </div>

    <Message severity="warn" :closable="false">
      ⚠ 시뮬레이션입니다 — 실제 작업은 생성되지 않습니다.
    </Message>

    <div class="flex flex-wrap items-center gap-3">
      <Select
        v-model="companyId"
        :options="teams"
        option-label="name"
        option-value="id"
        placeholder="회사 선택"
        showClear />
      <InputText class="w-40" v-model="date" placeholder="YYYY-MM-DD" />
      <Button
        label="미리보기"
        severity="primary"
        :loading="loading"
        :disabled="!companyId || !date"
        @click="preview" />
    </div>

    <div class="flex flex-col gap-3" v-if="result">
      <div class="flex items-center gap-3">
        <span class="font-medium">영업일 = {{ result.businessDay }}</span>
        <Tag
          :value="result.enabled ? '사용' : '미사용'"
          :severity="result.enabled ? 'success' : 'secondary'" />
      </div>

      <ListDataTable
        :data="result.rows"
        :status="loading ? 'pending' : 'success'"
        :page="0"
        :size="result.rows.length || 1"
        :use-num="false">
        <template #columns>
          <Column class="text-center" header="실행순서">
            <template #body="slotProps">{{ slotProps.index + 1 }}</template>
          </Column>
          <Column
            class="text-center"
            field="insuranceCompanyCode"
            header="보험사"></Column>
          <Column class="text-center" field="jobType" header="작업구분"></Column>
          <Column class="text-center" header="카테고리">
            <template #body="slotProps">{{
              categoryLabel(slotProps.data.category)
            }}</template>
          </Column>
          <Column class="text-center" field="closingMonthNum" header="업적월"></Column>
          <Column class="text-center" field="startAfter" header="시작시각"></Column>
          <Column class="text-right" field="priority" header="우선순위"></Column>
          <Column class="text-center" header="수동">
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.manual ? '수동' : '자동'"
                :severity="slotProps.data.manual ? 'warning' : 'info'" />
            </template>
          </Column>
        </template>
      </ListDataTable>
    </div>
  </div>
</template>
