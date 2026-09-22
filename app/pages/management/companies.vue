<script setup lang="ts">
  import type { DataTableRowClickEvent, DataTableSortEvent } from 'primevue/datatable'
  import type { PageState } from 'primevue/paginator'
  import type { Company, CompanyListItem } from '~/types/company'

  const { refreshTeams } = useGlobalData()
  const { request } = useClientAPI()
  const dialog = useDialog()

  const nameLike = ref<string>('')
  const page = ref(0)
  const size = ref(100)
  const sort = ref(['createdTime,desc'])

  const { data, execute, status } = await useLazyAPI<ListResponse<CompanyListItem>>(
    `/api/companies`,
    {
      query: {
        page: page,
        size: size,
        sort: sort,
        nameLike: nameLike,
      },
    },
  )

  // 계정 화면 등의 회사 드롭다운(teams)이 바로 반영되도록 갱신
  const onChanged = async () => {
    await Promise.all([execute(), refreshTeams()])
  }

  const onPage = async (event: PageState) => {
    page.value = event.page
    size.value = event.rows
    await execute()
  }
  const onSort = async (event: DataTableSortEvent) => {
    if (!event.multiSortMeta) return
    sort.value = event.multiSortMeta.map(
      (meta) => `${meta.field},${meta.order === 1 ? 'asc' : 'desc'}`,
    )
    page.value = 0
    execute()
  }
  const clearFilter = () => {
    nameLike.value = ''
    page.value = 0
    execute()
  }
  const handleCreateCompany = () => {
    dialog.open(resolveComponent('DialogCompany'), {
      props: {
        modal: true,
        header: `회사 생성`,
      },
      onClose: (options) => {
        if (options?.data) onChanged()
      },
    })
  }
  const onRowClick = async (event: DataTableRowClickEvent<CompanyListItem>) => {
    const { data, statusCode } = await request<Company>(
      `/api/companies/${event.data.id}`,
      {
        method: 'GET',
      },
    )
    if (statusCode.value === 200) {
      dialog.open(resolveComponent('DialogCompany'), {
        data: data.value,
        props: {
          modal: true,
          header: `회사 상세`,
        },
        onClose: (options) => {
          if (options?.data) onChanged()
        },
      })
    }
  }
  const formatDate = (time?: number) => (time ? formatToKoreanTime(new Date(time)) : '')
</script>
<template>
  <ListDataTable
    :data="data?.values"
    :paging-info="data?.pagingInfo"
    :status="status"
    :page="page"
    :size="size"
    @page="onPage"
    @sort="onSort"
    @search="execute"
    @clear-filter="clearFilter"
    :row-class="() => 'cursor-pointer'"
    @row-click="onRowClick">
    <template #header-right>
      <div class="flex items-center gap-2">
        <Button
          class="!h-10"
          label="회사 생성"
          severity="primary"
          raised
          @click="handleCreateCompany" />
      </div>
    </template>
    <template #filters>
      <FloatLabel variant="on">
        <InputText
          class="w-64"
          id="nameLike"
          v-model.trim="nameLike"
          type="text"
          @keypress.prevent.enter="execute()" />
        <label class="dark:text-surface-0" for="nameLike">회사명</label>
      </FloatLabel>
    </template>
    <template #columns>
      <Column field="name" header="회사명" sortable></Column>
      <Column field="code" header="고유코드" sortable></Column>
      <Column field="leaderName" header="대표자"></Column>
      <Column field="phone" header="전화번호"></Column>
      <Column class="text-center" field="contractDate" header="계약일" sortable></Column>
      <Column
        class="text-center"
        field="nextPaymentDate"
        header="다음결제일"
        sortable></Column>
      <Column class="text-center" field="createdTime" header="생성일" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.createdTime) }}
        </template>
      </Column>
    </template>
  </ListDataTable>
</template>
