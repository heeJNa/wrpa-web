<script setup lang="ts">
  import type { DataTableSortEvent } from 'primevue/datatable'
  import type { PageState } from 'primevue/paginator'
  import { JobTypesEnum } from '~/types/enum'
  import type { WorkerDetail } from '~/types/worker'

  const { insuranceCompanyCodes, teams } = useGlobalData()
  const dialog = useDialog()
  const toast = useToast()
  const { request } = useClientAPI()
  const confirm = useConfirm()

  const workDate = ref<Date>(new Date())
  const companyId = ref<string>()
  const insuranceCompanyType = ref<string>()
  const insuranceCompanyCode = ref<string>()
  const jobType = ref<string>()
  const closingMonth = ref<Date>(new Date())
  const workState = ref<string>()
  const resultStatus = ref<string>()
  const createType = ref<string>()
  const workerId = ref<string>()
  const page = ref(0)
  const size = ref(25)
  const sort = ref<string[]>([])

  const refineWorkDate = computed(() => {
    return formatToKoreanTime(workDate.value, 'YYYY-MM-DD')
  })
  const refineClosingMonth = computed(() => {
    return formatToKoreanTime(closingMonth.value, 'YYYY-MM')
  })
  const { data: workStates } = await useLazyAPI<{ code: string; name: string }[]>(
    '/api/basic/work-states',
  )
  const { data: workers } = await useLazyAPI<ListResponse<WorkerDetail>>(
    `/api/workers/v2`,
    {
      query: {
        size: 1000,
      },
    },
  )
  const { data, execute, status } = await useLazyAPI<ListResponse<any>>(
    `/api/contract-crawl/works-v2`,
    {
      query: {
        page: page,
        size: size,
        sort: sort,
        workDate: refineWorkDate,
        compayId: companyId,
        closingMonth: refineClosingMonth, // Format to 'YYYY-MM'
        insuranceCompanyType: insuranceCompanyType,
        insuranceCompanyCode: insuranceCompanyCode,
        jobType: jobType,
        workState: workState,
        resultStatus: resultStatus,
        createType: createType,
      },
    },
  )

  const { data: summary, execute: executeSummary } = await useLazyAPI<{
    cancel: number
    fail: number
    success: number
    waiting: number
    working: number
  }>(`/api/contract-crawl/works-v2/summary`, {
    query: {
      page: page,
      size: size,
      sort: sort,
      workDate: refineWorkDate,
      compayId: companyId,
      closingMonth: refineClosingMonth, // Format to 'YYYY-MM'
      insuranceCompanyType: insuranceCompanyType,
      insuranceCompanyCode: insuranceCompanyCode,
      jobType: jobType,
      workState: workState,
      resultStatus: resultStatus,
      createType: createType,
    },
  })

  watch(data, () => {
    executeSummary()
  })

  const onPage = async (event: PageState) => {
    page.value = event.page
    size.value = event.rows
    await execute()
  }
  const onSort = async (event: DataTableSortEvent) => {
    if (!event.multiSortMeta) return
    const sortMeta = event.multiSortMeta.map((meta) => {
      return `${meta.field},${meta.order === 1 ? 'asc' : 'desc'}`
    })
    sort.value = sortMeta
    page.value = 0 // Reset to first page on sort
    execute()
  }
  const clearFilter = () => {
    workDate.value = new Date()
    companyId.value = undefined
    insuranceCompanyType.value = undefined
    insuranceCompanyCode.value = undefined
    jobType.value = undefined
    closingMonth.value = new Date()
    workState.value = undefined
    resultStatus.value = undefined
    createType.value = undefined
    workerId.value = undefined
    page.value = 0
    execute()
  }

  const onOpenWorkStateDetail = (_data: any) => {
    dialog.open(resolveComponent('DialogWorkStateDetail'), {
      data: _data,
      props: {
        modal: true,
        header: `작업 상세`,
      },
      onClose: (options) => {
        const data = options?.data
        if (data?.message === 'success' || data?.message === 'OK') execute()
      },
    })
  }

  const resendWorkResult = (workId?: string) => {
    if (!workId) {
      toast.add({
        severity: 'warn',
        summary: '경고',
        detail: '작업 ID가 없습니다.',
      })
    } else {
      confirm.require({
        message: '작업 결과를 해당 회사에 재전송하시겠습니까?',
        header: '작업 결과 전송',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
          label: '취소',
          severity: 'secondary',
          outlined: true,
        },
        acceptProps: {
          label: '전송',
        },
        accept: () => {
          request<any>(`/api/contract-crawl/works-v2/send-result/${workId}`, {
            method: 'POST',
          }).then(({ data, statusCode }) => {
            if (statusCode.value === 200) {
              toast.add({
                severity: 'success',
                summary: '성공',
                detail: '작업 결과가 성공적으로 전송되었습니다.',
                life: 3000,
              })
            } else {
              toast.add({
                severity: 'error',
                summary: '오류',
                detail: `작업 결과 전송 실패: ${data.value?.message || '알 수 없는 오류'}`,
                life: 3000,
              })
            }
          })
        },
        // reject: () => {
        //   toast.add({
        //     severity: 'error',
        //     summary: 'Rejected',
        //     detail: 'You have rejected',
        //     life: 3000,
        //   })
        // },
      })
    }
  }
</script>
<template>
  <ListDataTable
    :data="data?.values"
    :paging-info="data?.pagingInfo"
    :status="status"
    :page="page"
    :size="size"
    @page="onPage"
    @sort="onSort"
    @search="execute"
    @clearFilter="clearFilter"
    :row-class="() => 'cursor-pointer'"
    @row-click="(event) => onOpenWorkStateDetail(event.data)">
    <template #filters>
      <FloatLabel variant="on">
        <DatePicker
          class="w-48"
          v-model="workDate"
          dateFormat="yy-mm-dd"
          label-id="on_label"
          show-icon
          :manual-input="false"
          show-button-bar
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">작업일</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          class="w-64"
          v-model="companyId"
          :options="teams"
          showClear
          filter
          auto-filter-focus
          label-id="on_label"
          option-label="name"
          option-value="id"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">회사명</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          class="w-48"
          v-model="insuranceCompanyType"
          :options="insuranceCompanyTypes"
          showClear
          label-id="on_label"
          option-label="label"
          option-value="value"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">구분</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          class="w-64"
          v-model="insuranceCompanyCode"
          :options="insuranceCompanyCodes"
          showClear
          filter
          auto-filter-focus
          label-id="on_label"
          option-label="name"
          option-value="code"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">보험사</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          class="w-48"
          v-model="jobType"
          :options="enumToLabelValue(JobTypesEnum)"
          showClear
          label-id="on_label"
          option-label="label"
          option-value="value"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">작업구분</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <DatePicker
          class="w-48"
          v-model="closingMonth"
          view="month"
          dateFormat="yy-mm"
          label-id="on_label"
          show-icon
          :manual-input="false"
          show-button-bar
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">업적월</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          class="w-32"
          v-model="workState"
          :options="workStates"
          showClear
          label-id="on_label"
          option-label="name"
          option-value="code"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">상태</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          class="w-64"
          v-model="resultStatus"
          :options="workStatusCodes"
          showClear
          label-id="on_label"
          option-label="label"
          option-value="value"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">상태코드</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          class="w-32"
          v-model="createType"
          :options="workCreateTypes"
          showClear
          label-id="on_label"
          option-label="label"
          option-value="value"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">생성구분</label>
      </FloatLabel>
    </template>
    <template #toolbar-end>
      <span class="text-surface-500 dark:text-surface-100 text-lg font-bold">
        성공 {{ summary?.success || 0 }}건 | 실패 {{ summary?.fail || 0 }}건 | 작업
        {{ summary?.working || 0 }}건 | 대기 {{ summary?.waiting || 0 }}건 | 취소
        {{ summary?.cancel || 0 }}건
      </span>
    </template>
    <template #columns>
      <Column class="text-center" field="createTypeSimple" header="생성"> </Column>
      <Column field="companyName" header="회사명"> </Column>
      <Column field="accountName" header="계정명"> </Column>
      <Column field="insuranceCompanyName" header="보험사"> </Column>
      <Column class="text-center" field="jobSimple" header="작업"></Column>
      <Column field="contractCrawlDataModelPretty" header="파일명"></Column>
      <Column class="text-center" field="closingMonth" header="업적월"> </Column>
      <Column class="text-center" field="workerId" header="작업자"> </Column>
      <Column class="text-right" field="priority" header="우선순위"> </Column>
      <Column class="text-center" field="workStatePretty" header="상태">
        <template #body="slotProps">
          <Badge :severity="getColorByWorkState(slotProps.data.workState)" size="large">
            {{ slotProps.data.workStatePretty }}
          </Badge>
        </template>
      </Column>
      <Column
        class="overflow-hidden text-center overflow-ellipsis whitespace-nowrap"
        style="max-width: 10rem"
        field="note"
        header="비고">
        <template #body="slotProps">
          <span>{{ slotProps.data.note || '-' }}</span>
        </template>
      </Column>
      <Column class="text-center" header="파일수">
        <template #body="slotProps">
          <span
            >{{ slotProps.data?.filesSize || 0 }} /
            {{ slotProps.data?.filesSizeMax || 0 }}</span
          >
        </template>
      </Column>
      <Column class="text-center" field="retriedCount" header="시도"></Column>
      <Column class="text-center" header="생성일시">
        <template #body="slotProps">
          <span>{{ cutYearIfSame(slotProps.data?.createdTimePretty) }}</span>
        </template>
      </Column>
      <Column class="text-center" header="예정일시">
        <template #body="slotProps">
          <span
            >{{ cutYearIfSame(slotProps.data?.workScheduleDate) }}
            <span>{{ slotProps.data?.workScheduleTime || '-' }}</span></span
          >
        </template>
      </Column>
      <Column class="text-center" header="시작일시">
        <template #body="slotProps">
          <span>{{ cutYearIfSame(slotProps.data?.startedTimePretty) }} </span>
        </template>
      </Column>
      <Column class="text-center" header="Timeout(ms)">
        <template #body="slotProps">
          <span
            >{{ convertTimeoutMsToMinutesString(slotProps.data?.lifetime || 0) }}
          </span>
        </template>
      </Column>
      <Column class="text-center" header="소요시간">
        <template #body="slotProps">
          <span>{{ slotProps.data?.workTimePretty || '-' }} </span>
        </template>
      </Column>
      <Column class="text-center" header="전송">
        <template #body="slotProps">
          <Button
            class="mx-4"
            :disabled="slotProps.data?.resultStatus !== '200'"
            :severity="slotProps.data?.resultStatus === '200' ? '' : 'secondary'"
            size="small"
            @click="resendWorkResult(slotProps.data?.workId)"
            >전송</Button
          >
        </template>
      </Column>

      <!-- <Column field="originPathDetail" header="상세경로"></Column>
      <Column class="text-right" field="lifetime" header="Timeout(ms)"></Column> -->
      <!-- <Column field="note" header="비고">
        <template #body="slotProps">
          {{ slotProps.data.note || '-' }}
        </template>
      </Column> -->
    </template>
  </ListDataTable>
</template>
