<script setup lang="ts">
  import type { SelectChangeEvent } from 'primevue/select'
  import { useJobForm } from '~/composables/forms/useJobForm'
  import type { AccountListItem } from '~/types/account'
  import type { JobTypesEnum } from '~/types/enum'
  import type { Job, JobTypes } from '~/types/job'
  import { ACTIVE_BASIS_OPTIONS, resolveWindowDates } from '~/types/active-window'

  const { insuranceCompanyCodes, teams } = useGlobalData()
  const { request } = useClientAPI()
  const { jobForm, errors, validate } = useJobForm()
  const toast = useToast()
  const dialogRef = inject<any>('dialogRef')
  const isCreateMode = ref(true)

  const accounts = ref<AccountListItem[]>([])
  const models = ref<any[]>([])
  const jobTypes = ref<JobTypes[]>([])

  const companyId = ref<string>()
  const insuranceCompanyCode = ref<string>()

  // 이번 달 기준 실제 생성일 안내 — 영업일 기준이면 서버의 월별 영업일 목록으로 환산
  const monthDates = ref<string[]>([])
  const yearMonth = formatToKoreanTime(new Date(), 'YYYY-MM')
  const windowHint = computed(() => {
    const r = resolveWindowDates(
      jobForm.value.activeBasis,
      jobForm.value.activeFrom,
      jobForm.value.activeTo,
      monthDates.value,
      yearMonth,
    )
    if (!r) return '이번 달에는 생성일이 없습니다'
    return `이번 달 실제 생성일: ${r.first} ~ ${r.last}`
  })
  watch(
    () => jobForm.value.activeBasis,
    (b) => {
      if (b === 'BUSINESS_DAY') jobForm.value.excludeHoliday = false
    },
  )

  onMounted(async () => {
    const job = dialogRef.value.data as Job
    if (job) {
      insuranceCompanyCode.value = job.insuranceCompanyCode
      companyId.value = job.companyId
      jobForm.value = { ...job }
      isCreateMode.value = false
      await initJobDependencies()
    }
    const { data } = await request<{ month: string; dates: string[] }>(
      `/api/business-day-order/business-days?month=${yearMonth}`,
    )
    monthDates.value = data.value?.dates ?? []
  })

  const createJob = () => {
    console.log('Updating job:', jobForm.value)
    if (validate()) {
      request(`/api/contract-crawl/jobs-v2`, {
        method: 'POST',
        body: JSON.stringify(jobForm.value),
      }).onFetchResponse(async (response) => {
        await fetchResponseHandler(
          response,
          dialogRef,
          toast,
          '작업이 생성되었습니다.',
          '작업 생성에 실패했습니다.',
        )
      })
    }
  }
  const updateJob = async () => {
    console.log('Updating job:', jobForm.value)
    if (validate()) {
      request(`/api/contract-crawl/jobs-v2/${jobForm.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(jobForm.value),
      }).onFetchResponse(async (response) => {
        await fetchResponseHandler(
          response,
          dialogRef,
          toast,
          '작업이 수정되었습니다.',
          '작업 수정에 실패했습니다.',
        )
      })
    }
  }
  const deleteJob = async () => {
    request(`/api/contract-crawl/jobs-v2/${jobForm.value.id}`, {
      method: 'DELETE',
    }).onFetchResponse(async (response) => {
      await fetchResponseHandler(
        response,
        dialogRef,
        toast,
        '작업이 삭제되었습니다.',
        '작업 삭제에 실패했습니다.',
      )
    })
  }
  const getJobTypes = async (botId: string) => {
    const { data } = await request<JobTypes[]>(
      `/api/contract-crawl/bots/${botId}/job-types`,
    )
    if (data.value) {
      jobTypes.value = data.value
    }
  }
  const getAccounts = async (companyId: string, insuranceCompanyCode: string) => {
    const { data } = await request<ListResponse<AccountListItem>>(
      `/api/insure/accounts?companyId=${companyId}&insuranceCompanyCode=${insuranceCompanyCode}&page=0&size=9999`,
    )
    if (data.value) {
      accounts.value = data.value.values
    }
  }
  const getModels = async (jobType: string, insuranceCompanyCode: string) => {
    // TODO 추후 Model type 적용
    const { data } = await request<ListResponse<any>>(
      `/api/contract-crawl-data/models?jobType=${jobType}&insuranceCompanyCode=${insuranceCompanyCode}&page=0&size=9999`,
    )
    if (data.value) {
      models.value = data.value.values
    }
  }
  const initJobDependencies = async () => {
    if (companyId.value && insuranceCompanyCode.value) {
      await getAccounts(companyId.value, insuranceCompanyCode.value)
    }
    if (jobForm.value.botId) {
      await getJobTypes(jobForm.value.botId)
    }
    if (jobForm.value.jobType && insuranceCompanyCode.value) {
      await getModels(jobForm.value.jobType, insuranceCompanyCode.value)
    }
  }
  const onChangeCompanyIdOrInsuranceCompanyCode = (event: SelectChangeEvent) => {
    jobForm.value.botId = ''
    jobForm.value.jobType = ''
    jobForm.value.contractCrawlDataModelId = ''
    accounts.value = []
    jobTypes.value = []
    models.value = []
    initJobDependencies()
  }
  const onChangeBotId = async (event: SelectChangeEvent) => {
    jobForm.value.jobType = ''
    jobForm.value.contractCrawlDataModelId = ''
    jobTypes.value = []
    if (event.value) {
      await getJobTypes(event.value)
    }
  }
  const onChangeJobType = (event: SelectChangeEvent) => {
    jobForm.value.contractCrawlDataModelId = ''
    if (event.value && insuranceCompanyCode.value) {
      getModels(event.value, insuranceCompanyCode.value)
    }
  }
</script>
<template>
  <!-- 이 다이얼로그는 여는 쪽(작업일정 목록)이 폭을 64rem 으로 지정한다.
       여기서 다시 vw 로 좁히면 넓은 창 안에 좁은 폼만 남으므로 창을 그대로 채운다. -->
  <div class="w-full">
    <form class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2" @submit.prevent>
      <DialogForm label="회사명" required>
        <template #input>
          <Select
            id="insuranceCompanyCode"
            v-model="companyId"
            :options="teams"
            showClear
            option-label="name"
            option-value="id"
            @change="onChangeCompanyIdOrInsuranceCompanyCode" />
        </template>
      </DialogForm>
      <DialogForm label="보험사" required>
        <template #input>
          <Select
            id="insuranceCompanyCode"
            v-model="insuranceCompanyCode"
            :options="insuranceCompanyCodes"
            showClear
            filter
            auto-filter-focus
            option-label="name"
            option-value="code"
            @change="onChangeCompanyIdOrInsuranceCompanyCode" />
        </template>
      </DialogForm>
      <DialogForm label="계정명" :error="errors?.botId" required>
        <template #input>
          <Select
            id="botId"
            v-model="jobForm.botId"
            :options="accounts"
            showClear
            :invalid="!!errors?.botId"
            option-label="name"
            option-value="id"
            :placeholder="
              !companyId
                ? '회사를 선택해주세요'
                : !insuranceCompanyCode
                  ? '보험사를 선택해주세요'
                  : ''
            "
            @change="onChangeBotId"
        /></template>
      </DialogForm>
      <DialogForm label="작업유형" :error="errors?.jobType" required>
        <template #input>
          <Select
            id="botId"
            v-model="jobForm.jobType"
            :options="jobTypes"
            showClear
            :invalid="!!errors?.jobType"
            option-label="name"
            option-value="code"
            :placeholder="!jobForm.botId ? '계정을 선택해주세요' : ''"
            @change="onChangeJobType"
        /></template>
      </DialogForm>
      <DialogForm label="파일명" :error="errors?.contractCrawlDataModelId" required>
        <template #input>
          <Select
            id="botId"
            v-model="jobForm.contractCrawlDataModelId"
            :options="models"
            showClear
            :invalid="!!errors?.contractCrawlDataModelId"
            option-label="originPath"
            option-value="id"
            :placeholder="!jobForm.jobType ? '작업유형을 선택해주세요' : ''"
        /></template>
      </DialogForm>
      <div></div>
      <div class="col-span-2 flex flex-wrap justify-between gap-x-4 gap-y-3">
        <DialogForm
          class="shrink-0"
          label="생성 범위 기준"
          :error="errors?.activeBasis"
          required>
          <template #input>
            <SelectButton
              class="whitespace-nowrap"
              id="activeBasis"
              v-model="jobForm.activeBasis"
              :options="ACTIVE_BASIS_OPTIONS"
              option-label="label"
              option-value="value"
              :allow-empty="false" />
          </template>
        </DialogForm>
        <DialogForm class="min-w-24 flex-1" label="시작" :error="errors?.activeFrom">
          <template #input>
            <InputNumber
              id="activeFrom"
              v-model="jobForm.activeFrom"
              :min="1"
              :max="31"
              showButtons
              fluid
              :invalid="!!errors?.activeFrom"
              placeholder="비움=1" />
          </template>
        </DialogForm>
        <DialogForm class="min-w-24 flex-1" label="종료" :error="errors?.activeTo">
          <template #input>
            <InputNumber
              id="activeTo"
              v-model="jobForm.activeTo"
              :min="1"
              :max="31"
              showButtons
              fluid
              :invalid="!!errors?.activeTo"
              placeholder="비움=무제한" />
          </template>
        </DialogForm>
        <DialogForm
          class="min-w-24 flex-1"
          label="시간"
          :error="errors?.workTime"
          required>
          <template #input>
            <InputText
              id="workTime"
              v-model="jobForm.workTime"
              fluid
              autocomplete="off"
              :invalid="!!errors?.workTime"
              placeholder="hh:mm" />
          </template>
        </DialogForm>
      </div>
      <small class="text-surface-500 col-span-2">{{ windowHint }}</small>
      <Message
        class="col-span-2"
        v-if="dialogRef.data?.legacyWindowConflict"
        severity="warn"
        :closable="false">
        예전 영업일 범위 {{ dialogRef.data?.legacyBizDayPretty ?? '?' }}가 함께 저장돼
        있습니다. 위 기준·범위를 확정해 저장하면 정리됩니다.
      </Message>
      <div class="col-span-2 flex flex-wrap gap-x-4 gap-y-3">
        <DialogForm
          class="min-w-20 flex-1/5"
          label="업적월"
          :error="errors?.closingMonthNum"
          required>
          <template #input>
            <InputNumber
              id="closingMonthNum"
              v-model="jobForm.closingMonthNum"
              fluid
              :min="-12"
              :max="12"
              :invalid="!!errors?.closingMonthNum"
              autocomplete="off" />
          </template>
        </DialogForm>
        <DialogForm
          class="min-w-20 flex-1/5"
          label="우선순위"
          :error="errors?.priority"
          required>
          <template #input>
            <InputNumber
              id="priority"
              v-model="jobForm.priority"
              fluid
              :min="0"
              :max="999"
              :invalid="!!errors?.priority"
              autocomplete="off" />
          </template>
        </DialogForm>
        <DialogForm
          class="min-w-44 flex-auto"
          label="Timeout(ms)"
          :error="errors?.lifetime"
          required>
          <template #input>
            <div class="flex items-center">
              <InputNumber
                class="grow"
                id="lifetime"
                v-model="jobForm.lifetime"
                :min="0"
                :invalid="!!errors?.lifetime"
                autocomplete="off" />
              <span class="ml-2 text-sm whitespace-nowrap text-gray-500">
                {{ convertTimeoutMsToMinutesString(jobForm.lifetime) }}
              </span>
            </div>
          </template>
        </DialogForm>
        <DialogForm
          class="min-w-16 flex-auto text-center"
          :error="errors?.locked"
          label="잠금">
          <template #input>
            <div class="flex h-full items-center justify-center">
              <Checkbox id="locked" v-model="jobForm.locked" binary />
            </div>
          </template>
        </DialogForm>
      </div>
      <div class="col-span-2 flex flex-wrap gap-x-4 gap-y-3">
        <DialogForm
          class="min-w-32 flex-auto text-center"
          label="수동 우선순위 고정"
          :error="errors?.priorityManual">
          <template #input>
            <div class="flex h-full items-center justify-center">
              <Checkbox id="priorityManual" v-model="jobForm.priorityManual" binary />
            </div>
          </template>
        </DialogForm>
        <DialogForm
          class="flex-auto text-center"
          v-if="jobForm.activeBasis === 'CALENDAR_DAY'"
          label="휴일제외"
          :error="errors?.excludeHoliday">
          <template #input>
            <div
              class="flex h-full items-center justify-center"
              v-tooltip.top="
                '주말·공휴일(휴일관리)에는 작업을 생성하지 않습니다. 즉시 생성에는 적용되지 않습니다.'
              ">
              <Checkbox id="excludeHoliday" v-model="jobForm.excludeHoliday" binary />
            </div>
          </template>
        </DialogForm>
      </div>
    </form>
    <!-- 등록 버튼 -->
    <div class="mt-6 flex justify-center gap-4">
      <Button
        class="!h-10"
        v-if="isCreateMode"
        severity="primary"
        raised
        @click="createJob">
        생성
      </Button>
      <template v-else>
        <Button class="!h-10" severity="warn" raised @click="updateJob"> 수정 </Button>
        <Button class="!h-10" severity="danger" raised @click="deleteJob"> 삭제 </Button>
      </template>
    </div>
  </div>
</template>
<style lang="scss" module></style>
