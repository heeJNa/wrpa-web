<script setup lang="ts">
  import type { FileUploadSelectEvent } from 'primevue/fileupload'
  import { usePackageForm } from '~/composables/forms/usePackageForm'

  const { packages, errors, validate } = usePackageForm()
  const toast = useToast()

  const dialogRef = inject<any>('dialogRef')
  const uploading = ref(false)
  const fileupload = ref<any>(null)

  const comUrl = computed(() => {
    return `/api/packages?name=${packages.value.name}&version=${packages.value.version}&publishing=${String(packages.value.publishing)}`
  })
  const onFileSelected = (event: FileUploadSelectEvent) => {
    if (event.files && event.files.length > 0) {
      packages.value.file = event.files[0]
    } else {
      packages.value.file = new File([], '') // Reset if no file selected
    }
  }
  const uploadPackage = () => {
    if (!validate()) return
    uploading.value = true
    fileupload.value.upload()
  }
  const onUploadPackage = () => {
    uploading.value = false
    toast.add({
      severity: 'success',
      summary: '성공',
      detail: '패키지가 성공적으로 업로드되었습니다.',
      life: 3000,
    })
    dialogRef.value?.close(packages.value) // Close dialog after upload
  }
  const onUploadError = () => {
    toast.add({
      severity: 'error',
      summary: '오류',
      detail: '파일 업로드에 실패했습니다.',
      life: 3000,
    })
    uploading.value = false
  }
</script>
<template>
  <div class="w-full sm:w-[80vw] md:w-[50vw] lg:w-[35vw] xl:w-[25vw]">
    <form class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-4" @submit.prevent>
      <!-- 회사명 -->
      <DialogForm class="col-span-2" label="파일명" :error="errors?.name" required>
        <template #input>
          <InputText
            id="name"
            v-model="packages.name"
            autocomplete="off"
            :invalid="!!errors?.name" />
        </template>
      </DialogForm>
      <!-- 계정명 -->
      <DialogForm class="col-span-2" label="버전" :error="errors?.version" required>
        <template #input>
          <InputText
            id="version"
            v-model="packages.version"
            autocomplete="off"
            :invalid="!!errors?.version"
        /></template>
      </DialogForm>
      <div class="col-span-3">
        <FileUpload
          ref="fileupload"
          mode="basic"
          name="file"
          :url="comUrl"
          :maxFileSize="1000000000"
          @upload="onUploadPackage"
          @error="onUploadError"
          @select="onFileSelected" />
        <div class="mt-1 text-red-500" v-if="errors?.file">
          <span class="text-sm text-red-500" v-if="errors?.file">{{
            errors.file[0]
          }}</span>
        </div>
      </div>
      <DialogForm
        class="col-span-1 justify-self-center"
        label="배포"
        :error="errors?.publishing"
        horizontal>
        <template #input>
          <Checkbox id="publishing" v-model="packages.publishing" binary />
        </template>
      </DialogForm>
    </form>
    <ProgressBar class="my-4" v-if="uploading" mode="indeterminate" style="height: 6px" />
    <!-- :dt="{
        value: {
          background: '#000',
        },
      }" -->
    <div class="mt-6 flex justify-center gap-4">
      <Button class="!h-10" severity="primary" raised @click="uploadPackage">
        업로드
      </Button>
    </div>
  </div>
</template>
<style lang="scss" module></style>
