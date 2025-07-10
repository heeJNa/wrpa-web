<script setup lang="ts">
  import type { DataTableSortEvent } from 'primevue/datatable'
  import type { PageState } from 'primevue/paginator'
  import type { WorkerDetail } from '~~/types/worker'

  const { insuranceCompanyCodes } = useGlobalData()

  const companyName = ref<string>()
  const tag = ref<string>()
  const type = ref<string>()
  const page = ref(0)
  const size = ref(25)
  const sort = ref<string[]>(['name,desc'])
  const { data: owners } = await useLazyAPI<LabelValue[]>(`/api/workers/owners`)
  const { data: types } =
    await useLazyAPI<{ code: string; name: string }[]>(`/api/workers/types`)
  const { data, execute, status } = await useLazyAPI<ListResponse<WorkerDetail>>(
    `/api/workers/v2`,
    {
      query: {
        page: page,
        size: size,
        sort: sort,
        companyName: companyName,
        tag: tag,
        type: type,
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
    type.value = undefined
    companyName.value = undefined
    tag.value = undefined
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
    <template #filters>
      <FloatLabel variant="on">
        <Select
          class="w-64"
          v-model="companyName"
          :options="owners"
          showClear
          label-id="on_label"
          option-label="label"
          option-value="value"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">소유자</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          class="w-64"
          v-model="tag"
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
          v-model="type"
          :options="types"
          :showClear="type !== ''"
          label-id="on_label"
          option-label="name"
          option-value="code"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">종류</label>
      </FloatLabel>
    </template>
    <template #columns>
      <Column
        class="text-center"
        field="name"
        header="이름"
        :show-filter-menu="false"
        sortable>
      </Column>
      <Column class="text-center" field="typePretty" header="종류"></Column>
      <Column class="text-center" field="statePretty" header="상태"></Column>
      <Column class="text-center" field="owners" header="소유자">
        <template #body="slotProps">
          <span v-if="slotProps.data.owners && slotProps.data.owners.length > 0">
            {{ slotProps.data.owners.map((owner: LabelValue) => owner.label).join(', ') }}
          </span>
          <span v-else>없음</span>
        </template>
      </Column>
      <Column class="text-center" field="tags" header="보험사">
        <template #body="slotProps">
          <span v-if="slotProps.data.tags && slotProps.data.tags.length > 0">
            {{ slotProps.data.tags.map((tag: LabelValue) => tag.label).join(', ') }}
          </span>
          <span v-else>없음</span>
        </template>
      </Column>
      <Column class="text-center" field="version" header="버전"></Column>
      <Column class="text-center" field="launcherVersion" header="런처버전"></Column>
      <Column
        class="text-center"
        field="lastConnectedTimeRelative"
        header="마지막 연결 시간"></Column>
    </template>
  </ListDataTable>
</template>
