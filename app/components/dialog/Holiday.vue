<script setup lang="ts">
  import { holidaySchema, type HolidayForm } from '~/types/holiday'
  import { fetchResponseHandler } from '~/utils/dialog'

  const dialogRef = inject<any>('dialogRef')
  const { request } = useClientAPI()
  const toast = useToast()

  const form = ref<HolidayForm>({ holiday: '', title: '', memo: '' })
  const { errors, validate } = useFormValidator(holidaySchema, () => ({ ...form.value }))

  const save = () => {
    if (!validate()) return
    request(`/api/holiday`, {
      method: 'POST',
      body: JSON.stringify(form.value),
    }).onFetchResponse(async (response) => {
      await fetchResponseHandler(
        response,
        dialogRef,
        toast,
        '공휴일이 추가되었습니다.',
        '추가에 실패했습니다.',
      )
    })
  }
</script>

<template>
  <div class="flex flex-col gap-3 p-2" style="min-width: 320px">
    <DialogForm label="날짜(YYYY-MM-DD)" :error="errors?.holiday" required>
      <template #input
        ><InputText
          v-model="form.holiday"
          placeholder="2026-01-01"
          :invalid="!!errors?.holiday"
      /></template>
    </DialogForm>
    <DialogForm label="명칭" :error="errors?.title">
      <template #input><InputText v-model="form.title" placeholder="신정" /></template>
    </DialogForm>
    <DialogForm label="메모" :error="errors?.memo">
      <template #input><InputText v-model="form.memo" /></template>
    </DialogForm>
    <div class="flex justify-end"><Button label="저장" @click="save" /></div>
  </div>
</template>
