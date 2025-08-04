<script setup lang="ts">
  import type { DataTableRowClickEvent } from 'primevue/datatable'
  import type { Factory } from '~/types/factory'

  const dialog = useDialog()

  const page = ref(0)
  const size = ref(100)

  const { data, execute, status } = await useLazyAPI<Factory[]>(
    `/api/contract-crawl/factories`,
  )

  const handleCreateFactory = () => {
    dialog.open(resolveComponent('DialogFactory'), {
      props: {
        modal: true,
        header: `팩토리 생성`,
      },
      onClose: (options) => {
        if (options?.data) execute()
      },
    })
  }
  const openFactoryDetail = (event: DataTableRowClickEvent<Factory>) => {
    dialog.open(resolveComponent('DialogFactory'), {
      data: event.data,
      props: {
        modal: true,
        header: `팩토리 상세`,
      },
      onClose: (options) => {
        if (options?.data) execute()
      },
    })
  }
  // }
</script>
<template>
  <ListDataTable
    :data="data ?? []"
    :status="status"
    :page="page"
    :size="size"
    :headers="false"
    :row-class="() => 'cursor-pointer'"
    @row-click="openFactoryDetail">
    <template #header-right>
      <div class="flex items-center gap-2">
        <Button
          class="!h-10"
          label="등록"
          severity="primary"
          raised
          @click="handleCreateFactory" />
      </div>
    </template>
    <template #columns>
      <Column class="text-center" field="factoryName" header="이름" sortable> </Column>
      <Column class="text-center" field="insuranceCompanyName" header="보험사" sortable>
      </Column>
      <Column class="text-center" field="jobStates" header="작업유형" sortable>
        <template #body="slotProps">
          <span v-for="(job, index) in slotProps.data.jobStates" :key="index">
            {{ job.jobType
            }}<span v-if="index < slotProps.data.jobStates.length - 1">, </span>
          </span>
        </template>
      </Column>
      <Column class="text-center" field="state" header="상태"></Column>
    </template>
  </ListDataTable>
</template>
