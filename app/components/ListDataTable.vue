<script setup lang="ts">
  import type {
    DataTableCellEditCompleteEvent,
    DataTableEditingRows,
    DataTableRowClickEvent,
    DataTableRowEditSaveEvent,
    DataTableSortEvent,
  } from 'primevue/datatable'
  import type { PageState } from 'primevue/paginator'

  const {
    data,
    pagingInfo,
    dataKey = 'id',
    status,
    page,
    size,
    useNum = true,
    headers = true,
  } = defineProps<{
    data?: any[]
    pagingInfo?: PagingInfo
    dataKey?: string
    status: string
    page: number
    size: number
    useNum?: boolean
    editMode?: 'row' | 'cell'
    selectionMode?: 'single' | 'multiple'
    headers?: boolean
    selectCheckbox?: boolean
    rowClass?: (rowData: any) => string
  }>()
  const first = ref(0)
  watch(
    () => page,
    (newPage) => {
      first.value = newPage * size
    },
  )
  const editingRow = defineModel<any[] | DataTableEditingRows | undefined>('editingRow')
  const selection = defineModel<any | undefined>('selection')
  const emits = defineEmits<{
    (e: 'page', event: PageState): void
    (e: 'sort', sortEvent: DataTableSortEvent): void
    (e: 'search'): void
    (e: 'clearFilter'): void
    (e: 'cellEditComplete', event: DataTableCellEditCompleteEvent<any>): void
    (e: 'rowEditSave', event: DataTableRowEditSaveEvent<any>): void
    (e: 'rowClick', event: DataTableRowClickEvent<any>): void
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
      <CustomBreadcrumb
        :home="{ icon: 'pi pi-fw pi-home', route: '/' }"
        :items="getMenuChainFindByMenuPath(menus, $route.path) ?? []" />
      <!-- <div>
        <span>{{
          convertMenuChainToString(getMenuChainFindByMenuPath(menus, $route.path))
        }}</span>
      </div> -->
      <slot name="header-right" />
    </div>
    <div class="min-h-0">
      <DataTable
        v-model:selection="selection"
        v-model:editing-rows="editingRow"
        :value="data ?? []"
        :dataKey="dataKey"
        scrollable
        size="small"
        scroll-height="flex"
        lazy
        :edit-mode="editMode"
        removable-sort
        sort-mode="multiple"
        resizableColumns
        columnResizeMode="fit"
        showGridlines
        stripedRows
        row-hover
        :selection-mode="!selectCheckbox ? selectionMode : undefined"
        :loading="status === 'pending'"
        :row-class="rowClass"
        @page="onPage"
        @sort="onSort"
        @cell-edit-complete="$emit('cellEditComplete', $event)"
        @row-edit-save="$emit('rowEditSave', $event)"
        @row-click="$emit('rowClick', $event)">
        <template v-if="headers" #header>
          <div class="flex w-full items-start justify-between gap-2">
            <div class="min-w-[200px]">
              <div class="flex w-fit flex-wrap gap-2">
                <slot name="filters" />
              </div>
            </div>
            <div class="flex flex-shrink-0 flex-nowrap items-center gap-2">
              <div class="flex gap-2">
                <Button label="검색" severity="primary" @click="onSearch()" />
                <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  label="초기화"
                  outlined
                  @click="onClearFilter()" />
                <slot name="buttons" />
              </div>
            </div>
          </div>
          <Toolbar
            class="my-2 !border-0 !bg-transparent !p-0 !shadow-none"
            v-if="
              $slots?.['toolbar-start'] ||
              $slots?.['toolbar-center'] ||
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
        <Column
          v-if="selectCheckbox"
          :selectionMode="selectionMode ?? 'multiple'"
          headerStyle="width: 3rem;"
          style="text-align: center"></Column>
        <Column class="text-center" v-if="useNum" header="번호">
          <template #body="slotProps">
            <span v-if="pagingInfo?.totalElements">
              {{ pagingInfo.totalElements - page * size - slotProps.index }}
            </span>
            <span v-else-if="data">
              {{ data?.length - page * size - slotProps.index }}
            </span>
          </template>
        </Column>

        <slot name="columns" />
        <Column
          v-if="editMode === 'row'"
          :rowEditor="true"
          style="width: 10%; min-width: 8rem"
          bodyStyle="text-align:center">
        </Column>
        <template #footer>
          <div class="flex items-center justify-between">
            <span>
              총 검색결과: {{ pagingInfo?.totalElements ?? data?.length ?? 0 }}건</span
            >
            <Paginator
              v-model:first="first"
              :rows="size"
              :total-records="pagingInfo?.totalElements ?? data?.length ?? 0"
              :page-link-size="5"
              :rows-per-page-options="[25, 50, 100]"
              @page="onPage" />
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>
