<script setup lang="ts">
  import type { DataTableRowClickEvent, DataTableSortEvent } from 'primevue/datatable'
  import type { PageState } from 'primevue/paginator'
  import type { Account, AccountListItem } from '~/types/account'
  import type { PackageListItem } from '~/types/package'

  const { request } = useClientAPI()
  const toast = useToast()
  const dialog = useDialog()
  const confirm = useConfirm()

  const nameLike = ref<string>('')
  const page = ref(0)
  const size = ref(100)
  const sort = ref(['createdTime,desc'])
  // const filters = ref({
  //   companyName: { value: '', matchMode: 'contains' },
  // })
  // const getAccounts = async () => {
  const { data, execute, status } = await useLazyAPI<ListResponse<PackageListItem>>(
    `/api/packages`,
    {
      query: {
        page: page,
        size: size,
        sort: sort,
        name: nameLike,
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
    page.value = 0
    execute()
  }
  const downloadFile = async (file: MinioFile) => {
    if (!file) return

    try {
      const aTag = document.createElement('a')
      aTag.href = `${window.location.origin}/api/system/files/${file.bucketName}/${file.objectName}`
      aTag.download = file.objectName
      aTag.click()
      aTag.remove()
    } catch (error) {
      console.error('파일 다운로드 실패:', error)
      toast.add({
        severity: 'error',
        summary: '오류',
        detail: '파일 다운로드에 실패했습니다.',
        life: 3000,
      })
    }
  }
  const deleteFile = (packageItem: PackageListItem) => {
    confirm.require({
      message: `정말로 "${packageItem.name}(${packageItem.version})" 파일을 삭제하시겠습니까?
        이 작업은 되돌릴 수 없습니다.`,
      header: '패키지 파일 삭제',
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: '취소',
        severity: 'secondary',
        outlined: true,
      },
      acceptProps: {
        label: '삭제',
      },
      accept: async () => {
        try {
          const { statusCode } = await request(`/api/packages/${packageItem.id}`, {
            method: 'DELETE',
          })
          if (statusCode.value === 200) {
            toast.add({
              severity: 'success',
              summary: '성공',
              detail: '파일이 성공적으로 삭제되었습니다.',
              life: 3000,
            })
            execute() // Refresh the list after deletion
          } else {
            toast.add({
              severity: 'error',
              summary: '오류',
              detail: '파일 삭제에 실패했습니다.',
              life: 3000,
            })
          }
        } catch (error) {
          console.error('파일 삭제 실패:', error)
          toast.add({
            severity: 'error',
            summary: '오류',
            detail: '파일 삭제에 실패했습니다.',
            life: 3000,
          })
        }
      },
    })
  }
  const handleUploadFile = () => {
    dialog.open(resolveComponent('DialogPackageUpload'), {
      props: {
        modal: true,
        header: '패키지 파일 업로드',
      },
      onClose: (options) => {
        if (options?.data) execute() // Refresh the list after upload
      },
    })
  }
  const updatePublishing = (packageItem: PackageListItem) => {
    const publishingAction = packageItem.publishing ? '중단' : '시작'
    confirm.require({
      message: `정말로 "${packageItem.name}(${packageItem.version})" 파일 배포를 ${publishingAction}하시겠습니까?`,
      header: '패키지 파일 배포',
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: '취소',
        severity: 'secondary',
        outlined: true,
      },
      acceptProps: {
        label: publishingAction,
      },
      accept: () => {
        request(`/api/packages/${packageItem.id}/publish`, {
          method: 'POST',
        }).onFetchResponse(async (response) => {
          if (response.ok) {
            toast.add({
              severity: 'success',
              summary: '성공',
              detail: `배포가 ${publishingAction}되었습니다.`,
              life: 3000,
            })
            execute() // Toggle the publishing state
          } else {
            const errorData = await response.json()
            toast.add({
              severity: 'error',
              summary: '오류',
              detail:
                errorData.message || packageItem.publishing
                  ? '배포 중단에 실패했습니다.'
                  : '배포 시작에 실패했습니다.',
              life: 3000,
            })
          }
        })
      },
    })
  }
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
    @clear-filter="clearFilter">
    <template #header-right>
      <div class="flex items-center gap-2">
        <Button
          class="!h-10"
          label="파일 업로드"
          severity="primary"
          raised
          @click="handleUploadFile" />
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
        <label class="dark:text-surface-0" for="on_label">파일명</label>
      </FloatLabel>
    </template>
    <template #columns>
      <Column class="text-center" field="name" header="파일명" sortable> </Column>
      <Column class="text-center" field="version" header="버전" sortable></Column>
      <Column class="text-center" field="createdTimePretty" header="업로드시간"></Column>
      <Column class="text-center" field="publishing" header="배포">
        <template #body="slotProps">
          <!-- TODO 배포 API 적용 -->
          <Badge
            class="cursor-pointer"
            size="large"
            :value="slotProps.data.publishing ? '배포중' : '비활성'"
            :severity="slotProps.data.publishing ? 'success' : 'danger'"
            @click="updatePublishing(slotProps.data)"></Badge>
        </template>
      </Column>
      <Column class="text-center" header="다운로드">
        <template #body="slotProps">
          <Button class="mx-4" size="small" @click="downloadFile(slotProps.data?.file)"
            >다운로드</Button
          >
        </template>
      </Column>
      <Column class="text-center" header="삭제">
        <template #body="slotProps">
          <Button
            class="mx-4"
            :severity="'danger'"
            size="small"
            @click="deleteFile(slotProps.data)"
            >삭제</Button
          >
        </template>
      </Column>
    </template>
  </ListDataTable>
  <ConfirmDialog :pt="confirmPT" />
</template>
