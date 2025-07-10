<script setup lang="ts">
  import type { DataTableSortEvent } from 'primevue/datatable'
  import type { PageState } from 'primevue/paginator'

  const {
    data,
    status,
    page,
    size,
    useNum = true,
  } = defineProps<{
    data?: ListResponse<any>
    status: string
    page: number
    size: number
    useNum?: boolean
  }>()
  const first = ref(0)
  watch(
    () => page,
    (newPage) => {
      first.value = newPage * size
    },
  )
  const emits = defineEmits<{
    (e: 'page', event: PageState): void
    (e: 'sort', sortEvent: DataTableSortEvent): void
    (e: 'search'): void
    (e: 'clearFilter'): void
  }>()

  const onPage = (e: any) => {
    emits('page', e)
  }

  const onSort = (e: any) => {
    emits('sort', e)
  }
  const onSearch = () => {
    emits('search')
  }
  const onClearFilter = () => {
    emits('clearFilter')
  }
</script>

<template>
  <div class="flex h-full w-full flex-col gap-2 overflow-hidden">
    <div class="flex items-center justify-between gap-2">
      <div>
        <span>{{
          convertMenuChainToString(getMenuChainFindByMenuPath(menus, $route.path))
        }}</span>
      </div>
      <slot name="header-right" />
    </div>
    <div class="min-h-0">
      <DataTable
        :value="data?.values ?? []"
        dataKey="id"
        scrollable
        size="small"
        scroll-height="flex"
        lazy
        removable-sort
        sort-mode="multiple"
        resizableColumns
        columnResizeMode="fit"
        showGridlines
        stripedRows
        :loading="status === 'pending'"
        @page="onPage"
        @sort="onSort">
        <template #header>
          <div class="flex w-full items-start justify-between gap-2">
            <div class="min-w-[200px]">
              <div class="flex w-fit flex-wrap gap-2">
                <slot name="filters" />
              </div>
            </div>
            <div class="flex flex-shrink-0 flex-nowrap items-center gap-2">
              <div class="flex gap-2">
                <Button
                  class="!px-4"
                  label="검색"
                  severity="primary"
                  @click="onSearch()" />
                <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  label="초기화"
                  outlined
                  @click="onClearFilter()" />
              </div>
            </div>
          </div>
          <Toolbar
            class="my-2 !border-0 !bg-transparent !p-0 !shadow-none"
            v-if="
              $slots?.['toolbar-start'] ||
              $slots?.['oolbar-center'] ||
              $slots?.['toolbar-end']
            ">
            <template #start>
              <slot name="toolbar-start" />
            </template>
            <template #center>
              <slot name="toolbar-center" />
            </template>
            <template #end>
              <slot name="toolbar-end" />
            </template>
          </Toolbar>
        </template>

        <Column class="text-center" v-if="useNum" header="번호">
          <template #body="slotProps">
            {{
              data?.pagingInfo?.totalElements
                ? data.pagingInfo.totalElements - page * size - slotProps.index
                : ''
            }}
          </template>
        </Column>

        <slot name="columns" />

        <template #footer>
          <div class="flex items-center justify-between">
            <span> 총 검색결과: {{ data?.pagingInfo?.totalElements ?? 0 }}건</span>
            <Paginator
              v-model:first="first"
              :rows="size"
              :total-records="data?.pagingInfo?.totalElements ?? 0"
              :page-link-size="5"
              :rows-per-page-options="[25, 50, 100]"
              @page="onPage" />
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>
