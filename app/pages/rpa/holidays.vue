<script setup lang="ts">
  const { request } = useClientAPI()
  const dialog = useDialog()
  const toast = useToast()

  const year = ref<number>(new Date().getFullYear())
  const month = ref<number | undefined>(undefined)
  const page = ref(0)
  const size = ref(500)

  const { data, execute, status } = await useLazyAPI<any>(`/api/holiday`, {
    query: { year, month, page, size },
  })

  const rows = computed(
    () => data.value?.content ?? data.value?.values ?? data.value ?? [],
  )

  const openAdd = () => {
    dialog.open(resolveComponent('DialogHoliday'), {
      props: { modal: true, header: '공휴일 추가' },
      onClose: (o: any) => {
        if (o?.data) execute()
      },
    })
  }

  const sync = () => {
    request(`/api/holiday/sync?year=${year.value}`, { method: 'POST' }).then(
      ({ statusCode, data: res }) => {
        if (statusCode.value === 200) {
          toast.add({
            severity: 'success',
            summary: '성공',
            detail: (res.value as any)?.message ?? '동기화 완료',
            life: 3000,
          })
          execute()
        } else {
          toast.add({
            severity: 'error',
            summary: '오류',
            detail: '동기화에 실패했습니다.',
            life: 3000,
          })
        }
      },
    )
  }
</script>

<template>
  <ListDataTable :data="rows" :status="status" :page="page" :size="size" :use-num="true">
    <template #filters>
      <div class="flex items-center gap-2">
        <InputNumber v-model="year" :useGrouping="false" :min="2000" :max="2100" />
        <InputNumber
          v-model="month"
          :min="1"
          :max="12"
          placeholder="월(선택)"
          showClear />
        <Button label="조회" @click="execute()" />
      </div>
    </template>
    <template #buttons>
      <Button label="공휴일 API 동기화" icon="pi pi-sync" @click="sync" />
      <Button label="+ 수동 추가" severity="secondary" @click="openAdd" />
    </template>
    <template #columns>
      <Column class="text-center" field="holiday" header="날짜" />
      <Column class="text-center" field="title" header="명칭" />
      <Column class="text-center" field="memo" header="메모" />
    </template>
  </ListDataTable>
</template>
