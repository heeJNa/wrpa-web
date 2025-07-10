<script setup lang="ts">
  import type { DataTableSortEvent } from 'primevue/datatable'
  import type { PageState } from 'primevue/paginator'

  const { insuranceCompanyCodes, teams } = useGlobalData()

  const companyId = ref<string>()
  const insuranceCompanyCode = ref<string>()
  const insuranceCompanyType = ref<string>()
  const insureType = ref<string>()
  const jobType = ref<string>()
  const closingMonthNum = ref<number>(0)
  const lastClosingMonthNum = ref<number>(0) // For tracking last closing month
  const locked = ref<boolean>()
  const page = ref(0)
  const size = ref(25)
  const sort = ref<string[]>([])

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
</script>
<template>
  <ListDataTable
    :data="data"
    :status="status"
    :page="page"
    :size="size"
    @page="onPage"
    @sort="onSort"
    @search="execute"
    @clearFilter="clearFilter">
    <template #header-right>
      <div class="flex items-center gap-2">
        <Button class="!px-4" label="일정 생성" severity="primary" raised />
      </div>
    </template>
    <template #filters>
      <FloatLabel variant="on">
        <Select
          class="w-64"
          v-model="companyId"
          :options="teams"
          showClear
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
          :options="insuranceCompanyCodes"
          showClear
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
          :options="jobTypes"
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
    <!-- <template #toolbar-end>
      <div class="flex items-center gap-2">
        <Button class="!h-10 !px-4" label="계정 생성" severity="primary" raised />
      </div>
    </template> -->
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
      <Column class="text-center" field="lock" header="잠김">
        <template #body="slotProps">
          <Badge
            size="large"
            :value="slotProps.data.lock ? '잠김' : '활성'"
            :severity="slotProps.data.lock ? 'danger' : 'success'"></Badge>
        </template>
      </Column>
      <Column class="text-center" field="createdTime" header="생성일시"> </Column>
      <Column class="text-center" header="즉시생성">
        <template #body="slotProps">
          <Button class="!h-7 !px-4" label="작업생성" severity="primary" raised />
        </template>
      </Column>
    </template>
  </ListDataTable>
</template>
