<script setup lang="ts">
  const { request } = useClientAPI()
  const dialog = useDialog()
  const dialogRef = inject<any>('dialogRef')
  const toast = useToast()

  const data = ref<any>(null)
  onMounted(() => {
    data.value = dialogRef.value?.data // {user: 'primetime'}
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
  const changePriority = () => {
    if (!data.value.priority) data.value.priority = 0
    request(
      `/api/v2/contract-crawl/priority/${data.value.workId}/${data.value.priority}`,
      {
        method: 'POST',
      },
    ).onFetchResponse(async (response) => {
      if (response.ok) {
        toast.add({
          severity: 'success',
          summary: '성공',
          detail: '우선순위가 성공적으로 변경되었습니다.',
          life: 3000,
        })
        const responseData = await response.json()
        dialogRef.value?.close(responseData) // Close the dialog after changing timeout
      } else {
        toast.add({
          severity: 'error',
          summary: '오류',
          detail: '우선순위 변경에 실패했습니다.',
        })
      }
    })
  }
  const changeTimeout = () => {
    if (!data.value?.lifetime) data.value.lifetime = 0
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
  const downloadFile = (file: any) => {
    const url = `/api/system/files/${file.bucketName}/${file.fileName}`
    console.log('Downloading file from URL:', url)
    const link = document.createElement('a')
    link.href = url
    link.download = file.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
</script>
<template>
  <div>
    <div class="p-datatable-gridlines mb-4">
      <div class="p-datatable-header">
        <div class="flex items-center justify-between">
          <h6 class="font-bold">작업 제어</h6>
          <Button
            class="w-btn"
            v-if="['fail', 'cancel', 'success'].includes(data?.workState ?? '')"
            size="small"
            severity="secondary"
            label="작업 재시작"
            @click="restart">
          </Button>
          <Button
            class="w-btn"
            v-if="data?.workState === 'waiting'"
            severity="secondary"
            size="small"
            @click="cancel">
            작업 취소
          </Button>
          <Button
            class="w-btn"
            v-if="data?.workState === 'working'"
            severity="secondary"
            size="small"
            @click="cancel">
            작업 중지
          </Button>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-around gap-4 border-1 px-4 py-3">
        <div>
          <span class="font-bold">현상태:</span>
          <Badge
            class="mx-4 ml-2"
            :severity="getColorByWorkState(data.workState)"
            size="xlarge">
            {{ data.workStatePretty }}
          </Badge>
        </div>
        <div class="flex flex-nowrap items-center justify-center gap-4">
          <label class="block font-bold" for="timeout"> Timeout(ms) </label>
          <InputNumber v-model="data.lifetime" inputId="timeout" :use-grouping="false" />
          <span class="text-sm text-gray-500">
            {{ convertTimeoutMsToMinutesString(data.lifetime) }}</span
          >
          <Button class="w-btn" @click="changeTimeout"> 변경 </Button>
        </div>
        <div class="flex flex-nowrap items-center justify-center gap-4">
          <label class="block font-bold" for="priority"> 우선순위 </label>
          <InputNumber v-model="data.priority" inputId="priority" :use-grouping="false" />
          <Button class="w-btn" @click="changePriority"> 변경 </Button>
        </div>
      </div>
    </div>
    <div class="p-datatable-gridlines mb-4">
      <div class="p-datatable-header">
        <div class="flex items-center justify-between">
          <h6 class="font-bold">작업 이미지</h6>
        </div>
      </div>
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
          <div class="border-1 px-4 py-3 text-xl text-gray-500" v-else>
            이미지가 없습니다.
          </div>
        </div>
      </div>
    </div>
    <DataTable
      class="mb-4"
      v-if="data?.filesRaw"
      :value="data?.filesRaw || []"
      scrollable
      removable-sort
      scroll-height="flex"
      showGridlines
      stripedRows>
      <template #header>
        <div class="flex items-center justify-between">
          <h6 class="font-bold">파일 목록</h6>
          <Button
            class="w-btn"
            v-if="data?.file"
            size="small"
            icon="pi pi-download"
            label="전체 다운로드(ZIP)"
            @click="downloadFile(data.file)" />
        </div>
      </template>
      <template #empty>
        <div class="flex items-center justify-center text-xl text-gray-500">
          파일이 없습니다.
        </div>
      </template>
      <Column class="text-center" header="번호">
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>
      <Column field="fileName" header="파일명" />
      <Column header="다운로드">
        <template #body="slotProps">
          <div class="flex justify-center">
            <i
              class="pi pi-download hover:text-bold cursor-pointer hover:text-xl"
              @click="downloadFile(slotProps.data)" />
          </div>
        </template>
      </Column>
    </DataTable>
    <DataTable
      class="mb-4"
      :value="
        (data?.stateHistory || []).sort((a: any, b: any) => b.createdTime - a.createdTime)
      "
      scrollable
      removable-sort
      scroll-height="flex"
      showGridlines
      stripedRows>
      <template #header>
        <div class="flex items-center justify-between">
          <h6 class="font-bold">작업 히스토리</h6>
        </div>
      </template>
      <Column field="createdTimePretty" header="생성시간" sortable style="width: 19%" />
      <Column class="text-center" field="statePretty" header="상태" style="width: 7%" />
      <Column field="resultStatus" header="결과">
        <template #body="slotProps">
          <span v-if="slotProps.data?.resultStatus"
            >{{ slotProps.data?.resultStatus }} /
            {{ slotProps.data?.resultStatusPretty }}</span
          >
        </template>
      </Column>
      <Column field="note" header="비고" />
    </DataTable>
    <div class="p-datatable-gridlines mb-4">
      <div class="p-datatable-header">
        <div class="flex items-center justify-between">
          <h6 class="font-bold">비고</h6>
        </div>
      </div>
      <div class="flex items-center justify-center-safe gap-4 border-1 px-4 py-3">
        <span>{{ data?.note }}</span>
      </div>
    </div>
  </div>
</template>
<style lang="scss" module></style>
