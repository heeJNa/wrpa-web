<script setup lang="ts">
  import { JobTypesEnum } from '~/types/enum'
  import type { WorkerDetail } from '~/types/worker'

  const { insuranceCompanyCodes, teams } = useGlobalData()
  const toast = useToast()
  const { request } = useClientAPI()

  const workDate = ref<string>(formatToKoreanTime(new Date(), 'YYYY-MM-DD'))
  const companyId = ref<string>()
  const insuranceCompanyType = ref<string>()
  const insuranceCompanyCode = ref<string>()
  const jobType = ref<string>()
  const closingMonth = ref<string>()
  const workState = ref<string>()
  const resultStatus = ref<string>()
  const createType = ref<string>()
  const workerId = ref<string>()
  const page = ref(0)
  const size = ref(100)
  const sort = ref<string[]>([])

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
        workDate: workDate,
        companyId: companyId,
        closingMonth: closingMonth,
        insuranceCompanyType: insuranceCompanyType,
        insuranceCompanyCode: insuranceCompanyCode,
        jobType: jobType,
        state: workState,
        resultStatus: resultStatus,
        createType: createType,
        workerId: workerId,
        includedScheduled: 'Y',
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
      workDate: workDate,
      companyId: companyId,
      closingMonth: closingMonth,
      insuranceCompanyType: insuranceCompanyType,
      insuranceCompanyCode: insuranceCompanyCode,
      jobType: jobType,
      state: workState,
      resultStatus: resultStatus,
      createType: createType,
      workerId: workerId,
      includedScheduled: 'Y',
    },
    immediate: false,
  })

  watch(data, () => {
    executeSummary()
  })

  const onPage = async (event: { page: number; rows: number; first: number }) => {
    page.value = event.page
    size.value = event.rows
    await execute()
  }

  const clearFilter = () => {
    workDate.value = formatToKoreanTime(new Date(), 'YYYY-MM-DD')
    companyId.value = undefined
    insuranceCompanyType.value = undefined
    insuranceCompanyCode.value = undefined
    jobType.value = undefined
    closingMonth.value = undefined
    workState.value = undefined
    resultStatus.value = undefined
    createType.value = undefined
    workerId.value = undefined
    page.value = 0
    execute()
  }

  // Dialog state
  const showDialog = ref(false)
  const editData = ref<any>(null)

  const onOpenWorkStateDetail = (_data: any) => {
    editData.value = _data
    showDialog.value = true
  }
  const onDialogClose = (result?: any) => {
    showDialog.value = false
    if (result?.message === 'success' || result?.message === 'OK') execute()
  }

  // Resend confirm
  const showResendConfirm = ref(false)
  const resendWorkId = ref<string>()

  const resendWorkResult = (workId?: string) => {
    if (!workId) {
      toast.add({
        title: '경고',
        description: '작업 ID가 없습니다.',
        color: 'warning',
        icon: 'i-lucide-alert-triangle',
      })
    } else {
      resendWorkId.value = workId
      showResendConfirm.value = true
    }
  }

  const confirmResend = () => {
    showResendConfirm.value = false
    request<any>(`/api/contract-crawl/works-v2/send-result/${resendWorkId.value}`, {
      method: 'POST',
    }).then(({ data, statusCode }) => {
      if (statusCode.value === 200) {
        toast.add({
          title: '성공',
          description: '작업 결과가 성공적으로 전송되었습니다.',
          color: 'success',
          icon: 'i-lucide-check-circle',
          duration: 3000,
        })
      } else {
        toast.add({
          title: '오류',
          description: `작업 결과 전송 실패: ${data.value?.message || '알 수 없는 오류'}`,
          color: 'error',
          icon: 'i-lucide-circle-x',
          duration: 3000,
        })
      }
    })
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
    @search="execute"
    @clear-filter="clearFilter"
    @row-click="(event) => onOpenWorkStateDetail(event.data)">
    <template #filters>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-(--ui-text-muted)">작업일</label>
        <UInput class="w-48" v-model="workDate" type="date" @change="execute()" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-(--ui-text-muted)">회사명</label>
        <USelectMenu
          class="w-64"
          v-model="companyId"
          :items="teams"
          label-key="name"
          value-key="id"
          placeholder="회사명"
          @update:model-value="execute()" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-(--ui-text-muted)">구분</label>
        <USelectMenu
          class="w-48"
          v-model="insuranceCompanyType"
          :items="insuranceCompanyTypes"
          label-key="label"
          value-key="value"
          placeholder="구분"
          @update:model-value="execute()" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-(--ui-text-muted)">보험사</label>
        <USelectMenu
          class="w-64"
          v-model="insuranceCompanyCode"
          :items="insuranceCompanyCodes as any"
          label-key="name"
          value-key="code"
          placeholder="보험사"
          @update:model-value="execute()" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-(--ui-text-muted)">작업구분</label>
        <USelectMenu
          class="w-48"
          v-model="jobType"
          :items="enumToLabelValue(JobTypesEnum)"
          label-key="label"
          value-key="value"
          placeholder="작업구분"
          @update:model-value="execute()" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-(--ui-text-muted)">업적월</label>
        <UInput class="w-48" v-model="closingMonth" type="month" @change="execute()" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-(--ui-text-muted)">상태</label>
        <USelectMenu
          class="w-32"
          v-model="workState"
          :items="workStates ?? []"
          label-key="name"
          value-key="code"
          placeholder="상태"
          @update:model-value="execute()" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-(--ui-text-muted)">상태코드</label>
        <USelectMenu
          class="w-64"
          v-model="resultStatus"
          :items="workStatusCodes"
          label-key="label"
          value-key="value"
          placeholder="상태코드"
          @update:model-value="execute()" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-(--ui-text-muted)">생성구분</label>
        <USelectMenu
          class="w-32"
          v-model="createType"
          :items="workCreateTypes"
          label-key="label"
          value-key="value"
          placeholder="생성구분"
          @update:model-value="execute()" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-(--ui-text-muted)">작업자</label>
        <USelectMenu
          class="w-48"
          v-model="workerId"
          :items="(workers?.values ?? []) as any"
          label-key="name"
          value-key="id"
          placeholder="작업자"
          @update:model-value="execute()" />
      </div>
    </template>
    <template #toolbar-end>
      <span class="text-lg font-bold text-(--ui-text-muted)">
        성공 {{ summary?.success || 0 }}건 | 실패 {{ summary?.fail || 0 }}건 | 작업
        {{ summary?.working || 0 }}건 | 대기 {{ summary?.waiting || 0 }}건 | 취소
        {{ summary?.cancel || 0 }}건
      </span>
    </template>
    <template #column-headers>
      <th class="px-3 py-2 text-center text-xs font-semibold">생성</th>
      <th class="px-3 py-2 text-left text-xs font-semibold">회사명</th>
      <th class="px-3 py-2 text-left text-xs font-semibold">계정명</th>
      <th class="px-3 py-2 text-left text-xs font-semibold">보험사</th>
      <th class="px-3 py-2 text-center text-xs font-semibold">작업</th>
      <th class="px-3 py-2 text-left text-xs font-semibold">파일명</th>
      <th class="px-3 py-2 text-center text-xs font-semibold">업적월</th>
      <th class="px-3 py-2 text-center text-xs font-semibold">작업자</th>
      <th class="px-3 py-2 text-right text-xs font-semibold">우선순위</th>
      <th class="px-3 py-2 text-center text-xs font-semibold">상태</th>
      <th class="px-3 py-2 text-center text-xs font-semibold" style="max-width: 10rem">
        비고
      </th>
      <th class="px-3 py-2 text-center text-xs font-semibold">파일수</th>
      <th class="px-3 py-2 text-center text-xs font-semibold">시도</th>
      <th class="px-3 py-2 text-center text-xs font-semibold">생성일시</th>
      <th class="px-3 py-2 text-center text-xs font-semibold">예정일시</th>
      <th class="px-3 py-2 text-center text-xs font-semibold">시작일시</th>
      <th class="px-3 py-2 text-center text-xs font-semibold">Timeout(ms)</th>
      <th class="px-3 py-2 text-center text-xs font-semibold">소요시간</th>
      <th class="px-3 py-2 text-center text-xs font-semibold">전송</th>
    </template>
    <template #columns="{ data: row }">
      <td class="px-3 py-2 text-center">{{ row.createTypeSimple }}</td>
      <td class="px-3 py-2">{{ row.companyName }}</td>
      <td class="px-3 py-2">{{ row.accountName }}</td>
      <td class="px-3 py-2">{{ row.insuranceCompanyName }}</td>
      <td class="px-3 py-2 text-center">{{ row.jobSimple }}</td>
      <td class="px-3 py-2">{{ row.contractCrawlDataModelPretty }}</td>
      <td class="px-3 py-2 text-center">{{ row.closingMonth }}</td>
      <td class="px-3 py-2 text-center">{{ row.workerId }}</td>
      <td class="px-3 py-2 text-right">{{ row.priority }}</td>
      <td class="px-3 py-2 text-center">
        <UBadge :color="getColorByWorkState(row.workState) as any" size="lg">
          {{ row.workStatePretty }}
        </UBadge>
      </td>
      <td class="max-w-[10rem] truncate px-3 py-2 text-center">
        {{ row.note || '-' }}
      </td>
      <td class="px-3 py-2 text-center">
        {{ row?.filesSize || 0 }} / {{ row?.filesSizeMax || 0 }}
      </td>
      <td class="px-3 py-2 text-center">{{ row.retriedCount }}</td>
      <td class="px-3 py-2 text-center">{{ cutYearIfSame(row?.createdTimePretty) }}</td>
      <td class="px-3 py-2 text-center">
        {{ cutYearIfSame(row?.workScheduleDate) }}
        {{ row?.workScheduleTime || '-' }}
      </td>
      <td class="px-3 py-2 text-center">{{ cutYearIfSame(row?.startedTimePretty) }}</td>
      <td class="px-3 py-2 text-center">
        {{ convertTimeoutMsToMinutesString(row?.lifetime || 0) }}
      </td>
      <td class="px-3 py-2 text-center">{{ row?.workTimePretty || '-' }}</td>
      <td class="px-3 py-2 text-center" @click.stop>
        <UButton
          :disabled="row?.resultStatus !== '200'"
          :color="row?.resultStatus === '200' ? 'primary' : 'neutral'"
          size="sm"
          @click="resendWorkResult(row?.workId)">
          전송
        </UButton>
      </td>
    </template>
  </ListDataTable>

  <DialogWorkStateDetail v-if="showDialog" :data="editData" @close="onDialogClose" />

  <!-- Resend confirmation modal -->
  <UModal v-model:open="showResendConfirm">
    <template #header>
      <span class="font-semibold">작업 결과 전송</span>
    </template>
    <div class="p-6">
      <div class="mb-4 flex flex-col items-center gap-4">
        <UIcon class="size-12 text-yellow-500" name="i-lucide-alert-triangle" />
        <p class="text-center">작업 결과를 해당 회사에 재전송하시겠습니까?</p>
      </div>
      <div class="flex justify-center gap-4">
        <UButton
          color="neutral"
          variant="outline"
          label="취소"
          @click="showResendConfirm = false" />
        <UButton color="primary" label="전송" @click="confirmResend" />
      </div>
    </div>
  </UModal>
</template>
