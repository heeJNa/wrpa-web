<script setup lang="ts">
  import type { AccountListItem } from '~/types/account'
  import type { Job, JobBatchCopyPayload } from '~/types/job'

  const { insuranceCompanyCodes, teams } = useGlobalData()
  const { request } = useClientAPI()
  const toast = useToast()
  const dialogRef = inject<any>('dialogRef')

  const sourceJobs = ref<Job[]>([])
  const sourceInsuranceCompanyCode = ref<string>('')
  const sourceInsuranceCompanyName = computed(() => {
    return (
      insuranceCompanyCodes.value.find((c) => c.code === sourceInsuranceCompanyCode.value)
        ?.name || sourceInsuranceCompanyCode.value
    )
  })

  const targetCompanyId = ref<string>()
  const targetBotId = ref<string>()
  const accounts = ref<AccountListItem[]>([])
  const submitting = ref(false)

  onMounted(() => {
    const jobs = (dialogRef.value.data?.jobs ?? []) as Job[]
    sourceJobs.value = jobs
    sourceInsuranceCompanyCode.value = jobs[0]?.insuranceCompanyCode || ''
  })

  const loadAccounts = async () => {
    accounts.value = []
    targetBotId.value = undefined
    if (!targetCompanyId.value || !sourceInsuranceCompanyCode.value) return
    const { data } = await request<ListResponse<AccountListItem>>(
      `/api/insure/accounts?companyId=${targetCompanyId.value}&insuranceCompanyCode=${sourceInsuranceCompanyCode.value}&page=0&size=9999`,
    )
    if (data.value) {
      accounts.value = data.value.values
    }
  }

  const onSubmit = async () => {
    if (!targetBotId.value) {
      toast.add({
        severity: 'warn',
        summary: '경고',
        detail: '대상 계정을 선택해주세요.',
        life: 3000,
      })
      return
    }
    const payload: JobBatchCopyPayload = {
      ids: sourceJobs.value.map((j) => j.id),
      targetBotId: targetBotId.value,
    }
    submitting.value = true
    try {
      const { statusCode } = await request(`/api/contract-crawl/jobs/batch/copy-v2`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (statusCode.value === 200) {
        toast.add({
          severity: 'success',
          summary: '성공',
          detail: `${payload.ids.length}건이 복사되었습니다.`,
          life: 3000,
        })
        dialogRef.value.close({ success: true })
      } else {
        toast.add({
          severity: 'error',
          summary: '오류',
          detail: '일괄 복사에 실패했습니다.',
          life: 3000,
        })
      }
    } catch (e) {
      console.error('일괄 복사 실패:', e)
      toast.add({
        severity: 'error',
        summary: '오류',
        detail: '일괄 복사에 실패했습니다.',
        life: 3000,
      })
    } finally {
      submitting.value = false
    }
  }

  const onCancel = () => {
    dialogRef.value.close()
  }
</script>

<template>
  <div class="w-full sm:w-[90vw] md:w-[60vw] lg:w-[40vw] xl:w-[30vw]">
    <div class="bg-surface-100 dark:bg-surface-800 mb-4 rounded p-3 text-sm">
      <div>
        선택된 작업: <strong>{{ sourceJobs.length }}</strong
        >건
      </div>
      <div>
        원본 보험사: <strong>{{ sourceInsuranceCompanyName }}</strong>
      </div>
      <div class="text-surface-500 mt-1 text-xs">
        대상 계정의 보험사는 원본과 동일해야 합니다.
      </div>
    </div>
    <form class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2" @submit.prevent>
      <DialogForm label="대상 회사명" required>
        <template #input>
          <Select
            id="targetCompanyId"
            v-model="targetCompanyId"
            :options="teams"
            showClear
            filter
            auto-filter-focus
            option-label="name"
            option-value="id"
            @change="loadAccounts" />
        </template>
      </DialogForm>
      <DialogForm label="대상 계정명" required>
        <template #input>
          <Select
            id="targetBotId"
            v-model="targetBotId"
            :options="accounts"
            showClear
            filter
            auto-filter-focus
            option-label="name"
            option-value="id"
            :placeholder="
              !targetCompanyId
                ? '회사를 선택해주세요'
                : accounts.length === 0
                  ? '해당 보험사 계정이 없습니다'
                  : ''
            " />
        </template>
      </DialogForm>
    </form>
    <div class="mt-6 flex justify-center gap-4">
      <Button
        class="!h-10"
        severity="secondary"
        outlined
        :disabled="submitting"
        @click="onCancel">
        취소
      </Button>
      <Button
        class="!h-10"
        severity="primary"
        raised
        :loading="submitting"
        @click="onSubmit">
        복사 생성
      </Button>
    </div>
  </div>
</template>
