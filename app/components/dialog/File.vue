<script setup lang="ts">
  import { useFileForm } from '~/composables/forms/useFileForm'
  import { type File } from '~/types/file'

  const { insuranceCompanyCodes } = useGlobalData()
  const { request } = useClientAPI()
  const { fileForm, errors, validate } = useFileForm()
  const toast = useToast()
  const dialogRef = inject<any>('dialogRef')
  const isCreateMode = ref(true)

  const models = ref<any[]>([])

  const dataTypes = ref<EnumPretty[]>([])
  const fileTypes = ref<EnumPretty[]>([])
  const insureTypes = ref<EnumPretty[]>([])

  const companyId = ref<string>()
  const insuranceCompanyCode = ref<string>()
  onMounted(async () => {
    dataTypes.value = (dialogRef.value.data?.dataTypes as EnumPretty[]) ?? []
    fileTypes.value = (dialogRef.value.data?.fileTypes as EnumPretty[]) ?? []
    insureTypes.value = (dialogRef.value.data?.insureTypes as EnumPretty[]) ?? []
    const file = dialogRef.value.data?.file as File

    if (file) {
      fileForm.value = { ...file }
      isCreateMode.value = false
    }
  })

const upsertFile = (type: 'create' | 'update') => {
    console.log('fileForm', fileForm.value)
    
    if (validate()) {
      request(`/api/contract-crawl-data/models`, {
        method: 'POST',
        body: JSON.stringify(fileForm.value),
      }).onFetchResponse(async (response) => {
        await fetchResponseHandler(
          response,
          dialogRef,
          toast,
          `작업 파일이 ${type === 'create' ? '생성' : '수정'}되었습니다.`,
          `작업 파일 ${type === 'create' ? '생성' : '수정'}에 실패했습니다.`,
        )
      })
    }
  }

const deleteFile = async () => {
    request(`/api/contract-crawl-data/models/${fileForm.value.id}`, {
      method: 'DELETE',
    }).onFetchResponse(async (response) => {
      await fetchResponseHandler(
        response,
        dialogRef,
        toast,
        '작업 파일이 삭제되었습니다.',
        '작업 파일 삭제에 실패했습니다.',
      )
    })
  }

  // const onChangeCompanyIdOrInsuranceCompanyCode = (event: SelectChangeEvent) => {
  //   fileForm.value.botId = ''
  //   fileForm.value.jobType = ''
  //   fileForm.value.contractCrawlDataModelId = ''
  //   accounts.value = []
  //   jobTypes.value = []
  //   models.value = []
  //   initFileDependencies()
  // }
  // const onChangeBotId = async (event: SelectChangeEvent) => {
  //   fileForm.value.jobType = ''
  //   fileForm.value.contractCrawlDataModelId = ''
  //   jobTypes.value = []
  //   if (event.value) {
  //     await getFileTypes(event.value)
  //   }
  // }
  // const onChangeFileType = (event: SelectChangeEvent) => {
  //   fileForm.value.contractCrawlDataModelId = ''
  //   if (event.value && insuranceCompanyCode.value) {
  //     getModels(event.value, insuranceCompanyCode.value)
  //   }
  // }
</script>
<template>
  <div class="w-full sm:w-[80vw] md:w-[50vw] lg:w-[35vw] xl:w-[25vw]">
    <form class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2" @submit.prevent>
      <!-- <DialogForm label="회사명" required>
        <template #input>
          <Select
            id="insuranceCompanyCode"
            v-model="companyId"
            :options="teams"
            showClear
            option-label="name"
            option-value="id"
            @change="onChangeCompanyIdOrInsuranceCompanyCode" />
        </template>
      </DialogForm> -->
      <DialogForm label="보험사" required :error="errors?.insuranceCompanyCode">
        <template #input>
          <Select
            id="insuranceCompanyCode"
            v-model="fileForm.insuranceCompanyCode"
            :options="insuranceCompanyCodes"
            showClear
            :invalid="!!errors?.insuranceCompanyCode"
            option-label="name"
            option-value="code" />
        </template>
      </DialogForm>
      <DialogForm label="데이터" :error="errors?.dataType" required>
        <template #input>
          <Select
            id="dataType"
            v-model="fileForm.dataType"
            :options="dataTypes"
            showClear
            :invalid="!!errors?.dataType"
            option-label="pretty"
            option-value="name"
        /></template>
      </DialogForm>
      <DialogForm label="보종" :error="errors?.insureType" required>
        <template #input>
          <Select
            id="insureType"
            v-model="fileForm.insureType"
            :options="insureTypes"
            showClear
            :invalid="!!errors?.insureType"
            option-label="pretty"
            option-value="name"
        /></template>
      </DialogForm>
      <DialogForm label="파일 유형" :error="errors?.fileType" required>
        <template #input>
          <Select
            id="fileType"
            v-model="fileForm.fileType"
            :options="fileTypes"
            showClear
            :invalid="!!errors?.fileType"
            option-label="pretty"
            option-value="name"
        /></template>
      </DialogForm>
      <DialogForm label="콘텐츠" :error="errors?.contentType" required>
        <template #input>
          <InputText
            id="contentType"
            v-model="fileForm.contentType"
            autocomplete="off"
            :invalid="!!errors?.contentType"
            placeholder="A" />
        </template>
      </DialogForm>
      <DialogForm label="전산경로" :error="errors?.originPath" required>
        <template #input>
          <InputText
            id="originPath"
            v-model="fileForm.originPath"
            autocomplete="off"
            :invalid="!!errors?.originPath"
            placeholder="파일명" />
        </template>
      </DialogForm>
      <DialogForm class="col-span-2" label="상세경로" :error="errors?.originPathDetail">
        <template #input>
          <Textarea
            id="originPathDetail"
            v-model="fileForm.originPathDetail"
            rows="4"
            autocomplete="off"
            auto-resize />
        </template>
      </DialogForm>
      <DialogForm class="col-span-2" label="노트" :error="errors?.note">
        <template #input>
          <Textarea
            id="note"
            v-model="fileForm.note"
            rows="4"
            autocomplete="off"
            auto-resize />
        </template>
      </DialogForm>
      <DialogForm label="기본일정" :error="errors?.lifetime">
        <template #input>
          <InputNumber
            id="lifetime"
            v-model="fileForm.lifetime"
            autocomplete="off"
            :min="0"
            :invalid="!!errors?.lifetime" />
        </template>
      </DialogForm>
      <DialogForm label="기본일정" :error="errors?.cronSchedule">
        <template #input>
          <InputText
            id="cronSchedule"
            v-model="fileForm.cronSchedule"
            autocomplete="off"
            :invalid="!!errors?.cronSchedule"
            placeholder="0 0 * * *" />
        </template>
      </DialogForm>
      <!-- <div></div>
      <div class="col-span-2 flex justify-between gap-4">
    
     
        <DialogForm label="시간" :error="errors?.workTime" required>
          <template #input>
            <InputText
              id="workTime"
              v-model="fileForm.workTime"
              autocomplete="off"
              :invalid="!!errors?.workTime"
              placeholder="hh:mm" />
          </template>
        </DialogForm>
      </div>
      <div class="col-span-2 flex gap-4">
        <DialogForm
          class="flex-1/5"
          label="업적월"
          :error="errors?.closingMonthNum"
          required>
          <template #input>
            <InputNumber
              id="closingMonthNum"
              v-model="fileForm.closingMonthNum"
              fluid
              :min="-12"
              :max="12"
              :invalid="!!errors?.closingMonthNum"
              autocomplete="off" />
          </template>
        </DialogForm>
        <DialogForm class="flex-1/5" label="우선순위" :error="errors?.priority" required>
          <template #input>
            <InputNumber
              id="priority"
              v-model="fileForm.priority"
              fluid
              :min="0"
              :max="999"
              :invalid="!!errors?.priority"
              autocomplete="off" />
          </template>
        </DialogForm>
        <DialogForm
          class="flex-auto"
          label="Timeout(ms)"
          :error="errors?.lifetime"
          required>
          <template #input>
            <div class="flex items-center">
              <InputNumber
                class="grow"
                id="lifetime"
                v-model="fileForm.lifetime"
                :min="0"
                :invalid="!!errors?.lifetime"
                autocomplete="off" />
              <span class="ml-2 text-sm whitespace-nowrap text-gray-500">
                {{ convertTimeoutMsToMinutesString(fileForm.lifetime) }}
              </span>
            </div>
          </template>
        </DialogForm>
        <DialogForm class="flex-auto text-center" :error="errors?.locked" label="잠금">
          <template #input>
            <div class="flex h-full items-center justify-center">
              <Checkbox id="locked" v-model="fileForm.locked" binary />
            </div>
          </template>
        </DialogForm>
      </div> -->
    </form>
    <!-- 등록 버튼 -->
    <div class="mt-6 flex justify-center gap-4">
      <Button
        class="!h-10"
        v-if="isCreateMode"
        severity="primary"
        raised
        @click="upsertFile('create')">
        생성
      </Button>
      <template v-else>
        <Button class="!h-10" severity="warn" raised @click="upsertFile('update')">
          수정
        </Button>
        <Button class="!h-10" severity="danger" raised @click="deleteFile"> 삭제 </Button>
      </template>
    </div>
  </div>
</template>
<style lang="scss" module></style>
