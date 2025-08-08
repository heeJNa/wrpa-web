<script setup lang="ts">
  import type { DataTableRowClickEvent, DataTableSortEvent } from 'primevue/datatable'
  import type { PageState } from 'primevue/paginator'
  import { useJobForm } from '~/composables/forms/useJobForm'
  import { JobTypesEnum } from '~/types/enum'
  import type { Job, JobBatchUpdatePayload } from '~/types/job'

  const { insuranceCompanyCodes, teams } = useGlobalData()
  const { manualJobForm, manualErrors, manualValidate } = useJobForm()
  const { request } = useClientAPI()
  const toast = useToast()
  const dialog = useDialog()
  const confirm = useConfirm()

  const selection = ref<any[]>([])

  const companyId = ref<string>()
  const insuranceCompanyCode = ref<string>()
  const insuranceCompanyType = ref<string>()
  const insureType = ref<string>()
  const jobType = ref<string>()
  const closingMonthNum = ref<number>(0)
  const lastClosingMonthNum = ref<number>(0) // For tracking last closing month
  const locked = ref<boolean>()
  const page = ref(0)
  const size = ref(100)
  const sort = ref<string[]>([])

  const batchUpdatePayload = ref<JobBatchUpdatePayload>({
    ids: [],
    startDate: undefined,
    endDate: undefined,
    workTime: undefined,
    priority: undefined,
    closingMonthNum: undefined,
    timeout: undefined,
    locked: false,
  })
  const comFilterInsuranceCompanyCodes = computed(() => {
    return insuranceCompanyCodes.value.filter((code) => {
      return !insuranceCompanyType.value || code.type === insuranceCompanyType.value
    })
  })
  const { data, execute, status } = await useLazyAPI<ListResponse<any>>(
    `/api/contract-crawl/jobs-v2`,
    {
      query: {
        page: page,
        size: size,
        sort: sort,
        companyId: companyId,
        insuranceCompanyCode: insuranceCompanyCode,
        insuranceCompanyType: insuranceCompanyType,
        jobType: jobType,
        insureType: insureType,
        closingMonthNum: closingMonthNum,
        locked: locked,
      },
    },
  )

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
  const onUpdateClosingMonth = (val: number) => {
    if (val !== lastClosingMonthNum.value) {
      lastClosingMonthNum.value = closingMonthNum.value
      execute()
    }
  }
  const clearFilter = () => {
    companyId.value = undefined
    insuranceCompanyCode.value = undefined
    insuranceCompanyType.value = undefined
    jobType.value = undefined
    insureType.value = undefined
    closingMonthNum.value = 0
    lastClosingMonthNum.value = closingMonthNum.value
    locked.value = undefined
    page.value = 0
    execute()
  }
  const onRowClick = async (event: DataTableRowClickEvent<any>) => {
    const id = event.data.id
    if (isValidUUIDv4(id)) {
      const { data, statusCode } = await request<Job>(
        `/api/contract-crawl/jobs-v2/${id}`,
        {
          method: 'GET',
        },
      )
      if (statusCode.value === 200) {
        dialog.open(resolveComponent('DialogJob'), {
          data: data.value,
          props: {
            modal: true,
            header: `작업일정 상세`,
          },
          onClose: (options) => {
            const data = options?.data
            if (data) execute()
          },
        })
      }
    }
  }
  const onClickJobCreate = () => {
    dialog.open(resolveComponent('DialogJob'), {
      props: {
        modal: true,
        header: `작업일정 생성`,
      },
      onClose: (options) => {
        if (options?.data) execute()
      },
    })
  }

  const createWorkManually = (job: any) => {
    manualJobForm.value.closingMonthNum = job.closingMonthNum || 0
    manualJobForm.value.priority = job.priority || 100
    confirm.require({
      message: `"${job.accountName}(${job.contractCrawlDataModelPretty})" 작업을 
      즉시 생성하시겠습니까?`,
      header: '작업 생성',
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: '취소',
        severity: 'secondary',
        outlined: true,
      },
      acceptProps: {
        label: '생성',
      },
      onHide() {
        manualJobForm.value.closingMonthNum = 0
        manualJobForm.value.priority = 100
      },
      accept: async () => {
        if (!manualValidate()) return
        try {
          const { statusCode } = await request(
            `/api/contract-crawl/jobs/${job.id}/works-v2`,
            {
              method: 'POST',
              body: JSON.stringify({
                ...manualJobForm.value,
              }),
            },
          )
          if (statusCode.value === 200) {
            toast.add({
              severity: 'success',
              summary: '성공',
              detail: '작업이 성공적으로 생성되었습니다.',
              life: 3000,
            })
          } else {
            toast.add({
              severity: 'error',
              summary: '오류',
              detail: '작업 생성에 실패했습니다.',
              life: 3000,
            })
          }
        } catch (error) {
          console.error('작업 생성 실패:', error)
          toast.add({
            severity: 'error',
            summary: '오류',
            detail: '작업 생성에 실패했습니다.',
            life: 3000,
          })
        }
      },
    })
  }
  const onBatchUpdate = async () => {
    if (selection.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: '경고',
        detail: '수정할 작업을 선택해주세요.',
        life: 3000,
      })
      return
    }
    batchUpdatePayload.value.ids = selection.value.map((job) => job.id)
    try {
      const { statusCode } = await request(`/api/contract-crawl/jobs/batch/update-v2`, {
        method: 'PUT',
        body: JSON.stringify(batchUpdatePayload.value),
      })
      if (statusCode.value === 200) {
        toast.add({
          severity: 'success',
          summary: '성공',
          detail: '일괄 수정이 완료되었습니다.',
          life: 3000,
        })
        batchUpdatePayload.value.ids = []
        selection.value = []
        execute()
      } else {
        toast.add({
          severity: 'error',
          summary: '오류',
          detail: '일괄 수정에 실패했습니다.',
          life: 3000,
        })
      }
    } catch (error) {
      console.error('일괄 수정 실패:', error)
      toast.add({
        severity: 'error',
        summary: '오류',
        detail: '일괄 수정에 실패했습니다.',
        life: 3000,
      })
    }
  }
  const clearBatchUpdatePayload = () => {
    batchUpdatePayload.value = {
      ids: [],
      startDate: undefined,
      endDate: undefined,
      workTime: undefined,
      priority: undefined,
      closingMonthNum: undefined,
      timeout: undefined,
    }
  }
</script>
<template>
  <ListDataTable
    v-model:selection="selection"
    :data="data?.values"
    :paging-info="data?.pagingInfo"
    :status="status"
    :page="page"
    :size="size"
    selectCheckbox
    selectionMode="multiple"
    @page="onPage"
    @sort="onSort"
    @search="execute"
    @clearFilter="clearFilter"
    :row-class="() => 'cursor-pointer'"
    @row-click="onRowClick">
    <template #header-right>
      <div class="flex items-center gap-2">
        <Button
          class="!px-4"
          label="작업일정 생성"
          severity="primary"
          raised
          @click="onClickJobCreate" />
      </div>
    </template>
    <template #filters>
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
          class="w-64"
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
          :options="comFilterInsuranceCompanyCodes"
          showClear
          filter
          auto-filter-focus
          label-id="on_label"
          option-label="name"
          option-value="code"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">보험사</label>
      </FloatLabel>
      <!-- <FloatLabel variant="on">
            <Select
              class="w-64"
              v-model="insureType"
              :options="insureTypes"
              showClear
              label-id="on_label"
              option-label="label"
              option-value="value" />
            <label class="dark:text-surface-0" for="on_label">보종</label>
          </FloatLabel> -->
      <FloatLabel variant="on">
        <Select
          class="w-64"
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
        <InputNumber
          class="w-48"
          v-model="closingMonthNum"
          label-id="on_label"
          fluid
          showButtons
          incrementIcon="pi pi-plus"
          decrementIcon="pi pi-minus"
          buttonLayout="horizontal"
          @update:model-value="onUpdateClosingMonth">
        </InputNumber>
        <label class="dark:text-surface-0" for="on_label">업적월</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          class="w-48"
          v-model="locked"
          :options="[
            { label: '활성', value: false },
            { label: '잠김', value: true },
          ]"
          label-id="on_label"
          show-clear
          option-label="label"
          option-value="value"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">잠김 상태</label>
      </FloatLabel>
    </template>
    <template #toolbar-start>
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-lg font-semibold">일괄 수정</span>
        <FloatLabel variant="on">
          <InputText
            class="w-48"
            v-model="batchUpdatePayload.startDate"
            label-id="on_label"
            fluid>
          </InputText>
          <label class="dark:text-surface-0" for="on_label">시작일</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <InputText
            class="w-48"
            v-model="batchUpdatePayload.endDate"
            label-id="on_label"
            fluid>
          </InputText>
          <label class="dark:text-surface-0" for="on_label">종료일</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <InputText
            class="w-48"
            v-model="batchUpdatePayload.workTime"
            label-id="on_label"
            fluid>
          </InputText>
          <label class="dark:text-surface-0" for="on_label">시간</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <InputNumber
            class="w-48"
            v-model="batchUpdatePayload.closingMonthNum"
            :min="-12"
            :max="12"
            show-buttons
            label-id="on_label"
            fluid>
          </InputNumber>
          <label class="dark:text-surface-0" for="on_label">업적월</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <InputNumber
            class="w-48"
            v-model="batchUpdatePayload.priority"
            label-id="on_label"
            fluid>
          </InputNumber>
          <label class="dark:text-surface-0" for="on_label">우선순위</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <InputNumber
            class="w-48"
            v-model="batchUpdatePayload.timeout"
            label-id="on_label"
            fluid>
          </InputNumber>
          <label class="dark:text-surface-0" for="on_label">Timeout(ms)</label>
        </FloatLabel>
        <Checkbox v-model="batchUpdatePayload.locked" inputId="locked" binary />
        <label for="locked"> 잠금 </label>
      </div>
    </template>
    <template #toolbar-end>
      <div class="flex items-center gap-2">
        <Button
          type="button"
          label="일괄 수정"
          severity="primary"
          raised
          @click="onBatchUpdate" />
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="초기화"
          outlined
          @click="clearBatchUpdatePayload" />
        <slot name="buttons" />
      </div>
    </template>
    <template #columns>
      <Column
        class="text-center"
        field="companyName"
        header="회사명"
        :show-filter-menu="false"
        sortable>
      </Column>
      <Column
        class="text-center"
        field="insuranceCompanyName"
        header="보험사"
        sortable></Column>
      <Column class="text-center" field="accountName" header="계정"></Column>
      <Column field="contractCrawlDataModelPretty" header="작업파일"> </Column>
      <Column class="text-center" header="일정">
        <template #body="slotProps">
          <span
            >{{ slotProps.data?.startDate }} ~ {{ slotProps.data?.endDate }},
            {{ slotProps.data?.workTime }}</span
          >
        </template>
      </Column>
      <Column class="text-center" field="closingMonthNum" header="업적월"> </Column>
      <Column class="text-right" field="priority" header="우선순위"> </Column>
      <Column class="text-right" field="lifetime" header="Timeout(ms)"> </Column>
      <Column class="text-center" field="locked" header="잠김">
        <template #body="slotProps">
          <Badge
            size="large"
            :value="slotProps.data.locked ? '잠김' : '활성'"
            :severity="slotProps.data.locked ? 'danger' : 'success'"></Badge>
        </template>
      </Column>
      <Column class="text-center" field="createdTime" header="생성일시"> </Column>
      <Column class="text-center" header="즉시생성">
        <template #body="slotProps">
          <Button
            class="!h-7 !px-4"
            label="작업생성"
            severity="primary"
            raised
            @click="createWorkManually(slotProps.data)" />
        </template>
      </Column>
    </template>
  </ListDataTable>
  <ConfirmDialog :pt="confirmPT">
    <template #message="slotProps">
      <p class="text-center whitespace-pre-wrap">{{ slotProps.message.message }}</p>
      <div class="flex w-full justify-around gap-2">
        <DialogForm label="업적월" required :error="manualErrors.closingMonthNum">
          <template #input>
            <InputNumber
              id="manualClosingMonthNum"
              v-model="manualJobForm.closingMonthNum"
              fluid
              :min="-12"
              :max="12"
              :invalid="!!manualErrors.closingMonthNum"
              autocomplete="off" />
          </template>
        </DialogForm>
        <DialogForm label="우선순위" required :error="manualErrors.priority">
          <template #input>
            <InputNumber
              id="manualPriority"
              v-model="manualJobForm.priority"
              fluid
              :invalid="!!manualErrors.priority"
              :min="0"
              :max="999"
              autocomplete="off" />
          </template>
        </DialogForm>
      </div>
    </template>
  </ConfirmDialog>
</template>
