<script setup lang="ts">
  import type { DataTableRowClickEvent, DataTableSortEvent } from 'primevue/datatable'
  import type { PageState } from 'primevue/paginator'
  import type { Account, AccountListItem } from '~~/types/account'
  import { DialogAccount } from '#components'
  const { insuranceCompanyCodes, teams } = useGlobalData()
  const { request } = useClientAPI()
  const dialog = useDialog()

  const nameLike = ref<string>('')
  const userId = ref<string>('')
  const insuranceCompanyCode = ref<string>()
  const lock = ref<boolean>()
  const page = ref(0)
  const size = ref(25)
  const sort = ref(['createdTime,desc'])
  // const filters = ref({
  //   companyName: { value: '', matchMode: 'contains' },
  // })
  // const getAccounts = async () => {
  const { data, execute, status } = await useLazyAPI<ListResponse<AccountListItem>>(
    `/api/insure/accounts`,
    {
      query: {
        page: page,
        size: size,
        sort: sort,
        nameLike: nameLike,
        userId: userId,
        lock: lock,
        insuranceCompanyCode: insuranceCompanyCode,
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
    nameLike.value = ''
    userId.value = ''
    lock.value = undefined
    insuranceCompanyCode.value = undefined
    page.value = 0
    execute()
  }
  const openAccountCreate = () => {
    dialog.open(DialogAccount, {
      props: {
        modal: true,
        header: `계정 생성`,
      },
      onClose: (options) => {
        if (options?.data) execute()
      },
    })
  }
  const onRowClick = async (event: DataTableRowClickEvent<any>) => {
    const id = event.data.id
    if (isValidUUIDv4(id)) {
      const { data, statusCode } = await request<Account>(`/api/insure/accounts/${id}`, {
        method: 'GET',
      })
      if (statusCode.value === 200) {
        dialog.open(resolveComponent('DialogAccount'), {
          data: data.value,
          props: {
            modal: true,
            header: `계정 상세`,
          },
          onClose: (options) => {
            const data = options?.data
            if (data) execute()
          },
        })
      }
    }
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
    @clear-filter="clearFilter"
    :row-class="() => 'cursor-pointer'"
    @row-click="onRowClick">
    <template #header-right>
      <div class="flex items-center gap-2">
        <Button
          class="!h-10"
          label="계정 생성"
          severity="primary"
          raised
          @click="openAccountCreate" />
      </div>
    </template>
    <template #filters>
      <FloatLabel variant="on">
        <Select
          class="w-64"
          v-model="nameLike"
          :options="teams"
          showClear
          label-id="on_label"
          option-label="name"
          option-value="name"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">회사명</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputText
          class="w-64"
          id="userid"
          v-model.trim="userId"
          type="text"
          @keypress.prevent.enter="execute()" />
        <label class="dark:text-surface-0" for="on_label">아이디</label>
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
      <FloatLabel variant="on">
        <Select
          class="w-64"
          v-model="lock"
          :options="[
            { label: '활성', value: false },
            { label: '잠김', value: true },
          ]"
          label-id="on_label"
          showClear
          option-label="label"
          option-value="value"
          @update:model-value="execute()" />
        <label class="dark:text-surface-0" for="on_label">잠김 상태</label>
      </FloatLabel>
    </template>
    <template #columns>
      <Column field="companyName" header="회사명" :show-filter-menu="false" sortable>
        <!-- <template #filter="{ filterModel, filterCallback }">
            <InputText
              v-model="filterModel.value"
              type="text"
              @input="filterCallback()"
              placeholder="Search by name" />
          </template> -->
      </Column>
      <Column field="insuranceCompanyName" header="보험사" sortable></Column>
      <Column field="userId" header="아이디"></Column>
      <Column header="휴대폰">
        <template #body="slotProps">
          <span
            >{{ slotProps.data.userPhoneNumber }}
            {{
              slotProps.data.userPhoneNumber && slotProps.data.telecomAgency
                ? `(${slotProps.data.telecomAgency})`
                : ''
            }}</span
          >
        </template>
      </Column>
      <Column class="text-center" field="lock" header="잠김">
        <template #body="slotProps">
          <Badge
            size="large"
            :value="slotProps.data.lock ? '잠김' : '활성'"
            :severity="slotProps.data.lock ? 'danger' : 'success'"></Badge>
        </template>
      </Column>
    </template>
  </ListDataTable>
</template>
