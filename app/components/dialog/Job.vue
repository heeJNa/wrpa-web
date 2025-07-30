<script setup lang="ts">
  import type { SelectChangeEvent } from 'primevue/select'
  import { useJobForm } from '~/composables/forms/useJobForm'
  import type { AccountListItem } from '~/types/account'
  import type { JobTypesEnum } from '~/types/enum'
  import type { Job, JobTypes } from '~/types/job'

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
  onMounted(async () => {
    const job = dialogRef.value.data as Job
    if (job) {
      insuranceCompanyCode.value = job.insuranceCompanyCode
      companyId.value = job.companyId
      jobForm.value = { ...job }
      isCreateMode.value = false
      await initJobDependencies()
    }
  })

  const createJob = () => {
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
  <div class="w-full sm:w-[80vw] md:w-[50vw] lg:w-[35vw] xl:w-[25vw]">
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
      <div class="col-span-2 flex justify-between gap-4">
        <DialogForm label="시작일" :error="errors?.startDate" required>
          <template #input>
            <InputText
              id="startDate"
              v-model="jobForm.startDate"
              autocomplete="off"
              :invalid="!!errors?.startDate"
              placeholder="1 ~ 31" />
          </template>
        </DialogForm>
        <DialogForm label="종료일" :error="errors?.endDate" required>
          <template #input>
            <InputText
              id="endDate"
              v-model="jobForm.endDate"
              autocomplete="off"
              :invalid="!!errors?.endDate"
              placeholder="1 ~ 31" />
          </template>
        </DialogForm>
        <DialogForm label="시간" :error="errors?.workTime" required>
          <template #input>
            <InputText
              id="workTime"
              v-model="jobForm.workTime"
              autocomplete="off"
              :invalid="!!errors?.workTime"
              placeholder="hh:mm" />
          </template>
        </DialogForm>
      </div>
      <div class="col-span-2 flex gap-4">
        <DialogForm
          class="flex-1/5"
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
        <DialogForm class="flex-1/5" label="우선순위" :error="errors?.priority" required>
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
          class="flex-auto"
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
        <DialogForm class="flex-auto text-center" :error="errors?.locked" label="잠금">
          <template #input>
            <div class="flex h-full items-center justify-center">
              <Checkbox id="locked" v-model="jobForm.locked" binary />
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
