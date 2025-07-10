<script setup lang="ts">
  import type { DataTableSortEvent } from 'primevue/datatable'
  import type { PageState } from 'primevue/paginator'
  import type { WorkerDetail } from '~~/types/worker'

  const { insuranceCompanyCodes } = useGlobalData()

  const insuranceCompanyCode = ref<string>()
  const dataType = ref<string>()
  const fileType = ref<string>()
  const insureType = ref<string>()
  const page = ref(0)
  const size = ref(25)
  const sort = ref<string[]>([])
  const { data: dataTypes } = await useLazyAPI<EnumPretty[]>(
    '/api/contract-crawl-data/data-types',
  )
  const { data: fileTypes } = await useLazyAPI<EnumPretty[]>(
    `/api/contract-crawl-data/file-types`,
  )
  const { data: insureTypes } = await useLazyAPI<EnumPretty[]>(
    `/api/contract-crawl-data/insure-types`,
  )
  const { data, execute, status } = await useLazyAPI<ListResponse<any>>(
    `/api/contract-crawl-data/models`,
    {
      query: {
        page: page,
        size: size,
        sort: sort,
        insuranceCompanyCode: insuranceCompanyCode,
        dataType: dataType,
        fileType: fileType,
        insureType: insureType,
      },
    },
  )
  // }
  const onPage = async (event: PageState) => {
    page.value = event.page
    size.value = event.rows
    await execute()
  }
  // const onFilter = debounce((event: DataTableFilterEvent) => {}, 500)
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
    insuranceCompanyCode.value = undefined
    dataType.value = undefined
    fileType.value = undefined
    insureType.value = undefined
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
    @clear-filter="clearFilter">
    <template #header-right>
      <div class="flex items-center gap-2">
        <Button class="!h-10 !px-4" label="파일 생성" severity="primary" raised />
      </div>
    </template>
    <template #filters>
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
      <FloatLabel variant="on">
        <Select
          class="w-64"
          v-model="dataType"
          :options="dataTypes"
          showClear
          label-id="on_label"
          option-label="pretty"
          option-value="name"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">데이터구분</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          class="w-64"
          v-model="fileType"
          :options="fileTypes"
          showClear
          label-id="on_label"
          option-label="pretty"
          option-value="name"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">파일구분</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          class="w-64"
          v-model="insureType"
          :options="insureTypes"
          showClear
          label-id="on_label"
          option-label="pretty"
          option-value="name"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">보종</label>
      </FloatLabel>
    </template>
    <template #columns>
      <Column class="text-center" field="insuranceCompanyCodePretty" header="보험사">
      </Column>
      <Column class="text-center" field="dataTypePretty" header="데이터구분"></Column>
      <Column class="text-center" field="fileTypePretty" header="파일구분"></Column>
      <Column class="text-center" field="insureTypePretty" header="보종"> </Column>
      <Column class="text-center" field="contentType" header="콘텐츠구분"> </Column>
      <Column field="originPath" header="파일명"></Column>
      <Column field="originPathDetail" header="상세경로"></Column>
      <Column class="text-right" field="lifetime" header="Timeout(ms)"></Column>
      <!-- <Column field="note" header="비고">
        <template #body="slotProps">
          {{ slotProps.data.note || '-' }}
        </template>
      </Column> -->
    </template>
  </ListDataTable>
</template>
