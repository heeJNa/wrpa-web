<script setup lang="ts">
  const { request } = useClientAPI()
  const dialog = useDialog()
  const dialogRef = inject<any>('dialogRef')
  const toast = useToast()

  const data = ref<any>(null)
  const type = ref<WorkStateType>('STATE')
  onMounted(() => {
    data.value = dialogRef.value?.data?.data // {user: 'primetime'}
    type.value = dialogRef.value?.data?.type || 'STATE'
  })

  const restart = () => {
    if (!data.value?.workId) {
      toast.add({
        severity: 'error',
        summary: '작업 ID가 없습니다.',
        detail: '작업을 재시작할 수 없습니다.',
      })
      return
    }

    request(`/api/contract-crawl/works-v2/retry/${data.value.workId}`, {
      method: 'POST',
    }).onFetchResponse(async (response) => {
      if (response.ok) {
        toast.add({
          severity: 'success',
          summary: '성공',
          detail: '작업이 성공적으로 재시작되었습니다.',
          life: 3000,
        })
        const responseData = await response.json()
        dialogRef.value?.close(responseData) // Close the dialog after restart
      } else {
        toast.add({
          severity: 'error',
          summary: '오류',
          detail: '작업 재시작에 실패했습니다.',
        })
      }
    })
  }
  const cancel = () => {
    if (!data.value?.workId) {
      toast.add({
        severity: 'error',
        summary: '작업 ID가 없습니다.',
        detail: '작업을 취소할 수 없습니다.',
      })
      return
    }

    request(`/api/contract-crawl/works/${data.value.workId}/cancel-v2`, {
      method: 'POST',
    }).onFetchResponse(async (response) => {
      if (response.ok) {
        toast.add({
          severity: 'success',
          summary: '성공',
          detail: '작업이 성공적으로 취소되었습니다.',
          life: 3000,
        })
        const responseData = await response.json()
        dialogRef.value?.close(responseData) // Close the dialog after cancellation
      } else {
        toast.add({
          severity: 'error',
          summary: '오류',
          detail: '작업 취소에 실패했습니다.',
        })
      }
    })
  }
  const openImg = (image: any) => {
    dialog.open(resolveComponent('DialogImage'), {
      data: image,
      props: {
        header: '이미지 상세',
        modal: true,
        contentClass: 'max-h-full overflow-hidden flex flex-col',
      },
    })
  }
  const changeTimeout = () => {
    if (!data.value.lifetime) data.value.lifetime = 0
    request(
      `/api/v2/contract-crawl/timeout/${data.value.workId}/${data.value.lifetime}`,
      {
        method: 'POST',
      },
    ).onFetchResponse(async (response) => {
      if (response.ok) {
        toast.add({
          severity: 'success',
          summary: '성공',
          detail: 'Timeout이 성공적으로 변경되었습니다.',
          life: 3000,
        })
        const responseData = await response.json()
        dialogRef.value?.close(responseData) // Close the dialog after changing timeout
      } else {
        toast.add({
          severity: 'error',
          summary: '오류',
          detail: 'Timeout 변경에 실패했습니다.',
        })
      }
    })
  }
</script>
<template>
  <div v-if="type !== 'STATE'">
    <p class="p-4 text-2xl" v-if="type === 'NOTE'">{{ data?.note }}</p>
    <div v-else-if="type === 'PRIORITY'">
      <div class="flex items-center justify-center gap-4">
        <label class="block font-bold" for="priority"> 우선순위 </label>
        <InputNumber v-model="data.priority" inputId="priority" />
        <Button class="w-btn" @click="cancel"> 변경 </Button>
      </div>
    </div>
    <div v-else-if="type === 'TIMEOUT'">
      <div class="flex items-center justify-center gap-4">
        <label class="block font-bold" for="timeout"> Timeout(ms) </label>
        <InputNumber v-model="data.lifetime" inputId="timeout" :use-grouping="false" />
        <span class="text-sm text-gray-500">
          {{ convertTimeoutMsToMinutesString(data.lifetime) }}</span
        >
        <Button class="w-btn" @click="changeTimeout"> 변경 </Button>
      </div>
    </div>
    <!-- DETAIL -->
    <div v-else>
      <div class="mb-4">
        <div class="flex items-start gap-4">
          <div class="flex-1">
            <div
              class="flex gap-2 overflow-x-auto rounded border bg-gray-50 p-2"
              v-if="data?.images?.length">
              <img
                class="h-36 w-36 cursor-pointer rounded object-cover"
                v-for="image in data.images"
                :key="image.id"
                :src="`/api/system/files/${image.bucketName}/${image.fileName}`"
                :alt="image.fileName"
                @click="openImg(image)" />
            </div>
            <div class="text-2xl text-gray-400" v-else>이미지가 없습니다.</div>
          </div>
        </div>
      </div>
      <DataTable
        :value="
          (data?.stateHistory || []).sort(
            (a: any, b: any) => b.createdTime - a.createdTime,
          )
        "
        scrollable
        removable-sort
        scroll-height="flex"
        showGridlines
        stripedRows>
        <Column field="createdTimePretty" header="생성시간" sortable />
        <Column field="statePretty" header="상태" />
        <Column field="resultStatus" header="결과">
          <template #body="slotProps">
            <span
              >{{ slotProps.data?.resultStatus }} /
              {{ slotProps.data?.resultStatusPretty }}</span
            >
          </template>
        </Column>
        <Column field="note" header="비고" />
      </DataTable>
    </div>
  </div>
  <div v-else-if="data?.workState === 'fail'">
    <p class="p-4 text-2xl">{{ data?.resultStatus }} / {{ data?.resultStatusPretty }}</p>
    <div class="mt-4 flex justify-center">
      <Button class="w-btn" severity="danger" @click="restart"> 재시작 </Button>
    </div>
  </div>
  <div v-else-if="data?.workState === 'waiting'">
    <p class="p-4 text-2xl">작업을 취소하시겠습니까?</p>
    <div class="mt-4 flex justify-center">
      <Button class="w-btn" severity="contrast" @click="cancel"> 취소 </Button>
    </div>
  </div>
  <div v-else-if="data?.workState === 'cancel'">
    <p class="p-4 text-2xl">작업을 재시작하시겠습니까?</p>
    <div class="mt-4 flex justify-center">
      <Button class="w-btn" severity="danger" @click="restart"> 재시작 </Button>
    </div>
  </div>
  <div v-else-if="data?.workState === 'working'">
    <p class="p-4 text-2xl">작업을 중지하시겠습니까?</p>
    <div class="mt-4 flex justify-center">
      <Button class="w-btn" severity="warn" @click="cancel"> 중지 </Button>
    </div>
  </div>
  <div v-else-if="data?.workState === 'success'">
    <div></div>
    <!-- <img
      class="m-2 h-64 w-64 object-cover"
      v-for="image in data?.images"
      :src="`/api/system/files/${image.bucketName}/${image.fileName}`"
      :key="image.id" /> -->
  </div>
</template>
<style lang="scss" module></style>
