<script setup lang="ts">
  import type { DataTableRowEditSaveEvent, DataTableSortEvent } from 'primevue/datatable'
  import type { PageState } from 'primevue/paginator'
  import type { WorkerDetail } from '~/types/worker'

  const { insuranceCompanyCodes } = useGlobalData()
  const { request } = useClientAPI()
  const toast = useToast()
  const confirm = useConfirm()

  const editingRows = ref([])
  const selection = ref<any>()
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

  const onEditComplete = async (event: DataTableRowEditSaveEvent<WorkerDetail>) => {
    if (!event.newData.owners) event.newData.owners = []
    if (!event.newData.tags) event.newData.tags = []
    request(`/api/workers/v2/${event.newData.id}`, {
      method: 'PUT',
      body: JSON.stringify(event.newData),
    }).onFetchResponse((response) => {
      if (response.ok) {
        toast.add({
          severity: 'success',
          summary: '성공',
          detail: '작업자 정보가 성공적으로 업데이트되었습니다.',
          life: 3000,
        })
        execute()
      }
    })
  }
  const onDelete = async () => {
    confirm.require({
      message: `선택한 ${selection.value.length}개의 작업자를 정말로 삭제하시겠습니까?
        이 작업은 되돌릴 수 없습니다.`,
      header: '작업자 삭제',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '삭제',
      rejectProps: {
        label: '취소',
        severity: 'secondary',
        outlined: true,
      },
      accept: async () => {
        const requests = selection.value.map((item: WorkerDetail) => {
          return request(`/api/workers/v2/${item.id}`, {
            method: 'DELETE',
          }).onFetchResponse((response) => {
            if (response.ok) {
              toast.add({
                severity: 'success',
                summary: '성공',
                detail: `${item.name}가 성공적으로 삭제되었습니다.`,
                life: 3000,
              })
            }
          })
        })
        await Promise.all(requests)
        selection.value = []
        execute()
      },
    })
  }
</script>
<template>
  <ListDataTable
    v-model:selection="selection"
    v-model:editing-row="editingRows"
    :data="data?.values"
    :paging-info="data?.pagingInfo"
    :status="status"
    :page="page"
    :size="size"
    @page="onPage"
    @sort="onSort"
    @search="execute"
    @clearFilter="clearFilter"
    edit-mode="row"
    @row-edit-save="onEditComplete"
    select-checkbox
    dataKey="id">
    <template #filters>
      <FloatLabel variant="on">
        <Select
          class="w-64"
          v-model="companyName"
          :options="owners"
          showClear
          filter
          auto-filter-focus
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
          filter
          auto-filter-focus
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
    <template #buttons>
      <Button
        label="삭제"
        icon="pi pi-trash"
        severity="danger"
        variant="outlined"
        :disabled="!selection?.length"
        @click="onDelete" />
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
            {{
              owners
                ?.filter((owner) =>
                  (slotProps.data.owners as string[])?.includes(owner.value ?? ''),
                )
                .map((owner) => owner.label)
                .join(', ')
            }}
          </span>
          <span v-else>없음</span>
        </template>
        <template #editor="{ data, field }">
          <MultiSelect
            v-model="data[field]"
            :options="owners"
            showClear
            label-id="on_label"
            option-label="label"
            option-value="value"
            fluid />
        </template>
      </Column>
      <Column class="text-center" field="tags" header="보험사">
        <template #body="slotProps">
          <span v-if="slotProps.data.tags && slotProps.data.tags.length > 0">
            {{
              insuranceCompanyCodes
                ?.filter((item) =>
                  (slotProps.data.tags as string[])?.includes(item.code ?? ''),
                )
                .map((code) => code.name)
                .join(', ')
            }}
          </span>
          <span v-else>없음</span>
        </template>
        <template #editor="{ data, field }">
          <MultiSelect
            v-model="data[field]"
            :options="insuranceCompanyCodes"
            showClear
            label-id="on_label"
            option-label="name"
            option-value="code"
            fluid />
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
