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
    // 모바일에서는 검색을 누르면 필터를 접어 결과에 화면을 내준다
    if (isMobile.value) filtersOpen.value = false
  }
  const onClearFilter = () => {
    emits('clearFilter')
  }

  // md 미만에서는 표를 가로로 밀어 보는 대신 한 행을 한 장의 카드로 세워 읽는다.
  // 레이아웃 자체는 CSS(.p-datatable-mobile-cards)가 바꾸므로, 여기서는 화면 폭에
  // 따라 달라져야 하는 동작만 스크립트에서 다룬다.
  const isMobile = useMediaQuery('(max-width: 767.98px)')

  // 필터·일괄작업 영역은 세로로 쌓이면 화면을 통째로 먹어 정작 목록이 두어 줄만 남는다.
  // 모바일에서만 기본으로 접어 두고 토글로 연다(데스크톱은 항상 펼친 상태).
  const filtersOpen = ref(false)
  const slots = useSlots()
  const filterToggleLabel = computed(() =>
    slots['toolbar-start'] || slots['toolbar-center'] || slots['toolbar-end']
      ? '검색 필터 · 일괄 작업'
      : '검색 필터',
  )
</script>

<template>
  <div class="flex h-full w-full flex-col gap-2 overflow-hidden">
    <div class="flex flex-wrap items-center justify-between gap-2">
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
        class="p-datatable-mobile-cards"
        v-model:selection="selection"
        v-model:editing-rows="editingRow"
        :pt="{ column: mobileCardColumnPT }"
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
          <Button
            class="mb-2 w-full md:hidden"
            v-if="isMobile"
            :label="filterToggleLabel"
            :icon="filtersOpen ? 'pi pi-chevron-up' : 'pi pi-sliders-h'"
            severity="secondary"
            outlined
            @click="filtersOpen = !filtersOpen" />
          <div
            class="flex w-full flex-col items-stretch gap-2 md:flex-row md:items-start md:justify-between"
            v-show="!isMobile || filtersOpen">
            <div class="min-w-0 md:min-w-[200px]">
              <div class="list-filters flex flex-wrap gap-2 md:w-fit">
                <slot name="filters" />
              </div>
            </div>
            <div
              class="flex flex-wrap items-center gap-2 md:flex-shrink-0 md:flex-nowrap">
              <Button
                class="flex-1 md:flex-none"
                label="검색"
                severity="primary"
                @click="onSearch()" />
              <Button
                class="flex-1 md:flex-none"
                type="button"
                icon="pi pi-filter-slash"
                label="초기화"
                outlined
                @click="onClearFilter()" />
              <slot name="buttons" />
            </div>
          </div>
          <Toolbar
            class="my-2 !flex-wrap !gap-2 !border-0 !bg-transparent !p-0 !shadow-none"
            v-if="
              $slots?.['toolbar-start'] ||
              $slots?.['toolbar-center'] ||
              $slots?.['toolbar-end']
            "
            v-show="!isMobile || filtersOpen">
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
          <div
            class="flex flex-col items-center gap-1 md:flex-row md:justify-between md:gap-2">
            <span>
              총 검색결과: {{ pagingInfo?.totalElements ?? data?.length ?? 0 }}건</span
            >
            <Paginator
              class="!p-0"
              v-model:first="first"
              :rows="size"
              :total-records="pagingInfo?.totalElements ?? data?.length ?? 0"
              :page-link-size="isMobile ? 3 : 5"
              :rows-per-page-options="[25, 50, 100]"
              @page="onPage" />
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>
