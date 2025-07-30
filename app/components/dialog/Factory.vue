<script setup lang="ts">
  import type { DataTableRowEditSaveEvent } from 'primevue/datatable'
  import type { SelectChangeEvent } from 'primevue/select'
  import { useFactoryForm } from '~/composables/forms/useFactoryForm'
  import { JobTypesEnum, JobTypesStateEnum } from '~/types/enum'
  import type { Factory, FactoryForm } from '~/types/factory'

  const { insuranceCompanyCodes, teams } = useGlobalData()
  const { request } = useClientAPI()
  const { factoryForm, errors, validate } = useFactoryForm()
  const toast = useToast()

  const dialogRef = inject<any>('dialogRef')
  const isCreateMode = ref(true)

  onMounted(async () => {
    if (dialogRef.value?.data) {
      factoryForm.value = dialogRef.value.data as Factory
      isCreateMode.value = false
    }
  })

  const createFactory = () => {
    if (validate()) {
      request(`/api/contract-crawl/factories`, {
        method: 'POST',
        body: JSON.stringify(factoryForm.value),
      }).onFetchResponse(async (response) => {
        await fetchResponseHandler(
          response,
          dialogRef,
          toast,
          '팩토리가 생성되었습니다.',
          '팩토리 생성에 실패했습니다.',
        )
      })
    }
  }
  const updateFactory = async () => {
    if (validate()) {
      request(`/api/contract-crawl/factories/${factoryForm.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(factoryForm.value),
      }).onFetchResponse(async (response) => {
        await fetchResponseHandler(
          response,
          dialogRef,
          toast,
          '팩토리가 수정되었습니다.',
          '팩토리 수정에 실패했습니다.',
        )
      })
    }
  }
  const deleteFactory = async () => {
    request(`/api/contract-crawl/factories/${factoryForm.value.id}`, {
      method: 'DELETE',
    }).onFetchResponse(async (response) => {
      await fetchResponseHandler(
        response,
        dialogRef,
        toast,
        '팩토리가 삭제되었습니다.',
        '팩토리 삭제에 실패했습니다.',
      )
    })
  }
  const handleJobStateChange = (event: SelectChangeEvent) => {
    const findJobState = factoryForm.value.jobStates.find(
      (state) => state.jobType === event.value,
    )
  }
</script>
<template>
  <div class="w-full sm:w-[80vw] md:w-[50vw] lg:w-[35vw] xl:w-[25vw]">
    <form class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2" @submit.prevent>
      <DialogForm label="보험사" :error="errors?.insuranceCompanyCode" required>
        <template #input>
          <Select
            id="insuranceCompanyCode"
            v-model="factoryForm.insuranceCompanyCode"
            :options="insuranceCompanyCodes"
            showClear
            filter
            auto-filter-focus
            :invalid="!!errors?.insuranceCompanyCode"
            option-label="name"
            option-value="code" />
        </template>
      </DialogForm>
      <DialogForm label="팩토리명" :error="errors?.name" required>
        <template #input>
          <InputText
            id="name"
            v-model="factoryForm.name"
            autocomplete="off"
            :invalid="!!errors?.name"
        /></template>
      </DialogForm>
      <DialogForm label="상태" :error="errors?.state">
        <template #input>
          <Select
            id="state"
            v-model="factoryForm.state"
            :options="enumToLabelValue(JobTypesStateEnum)"
            :invalid="!!errors?.state"
            option-label="label"
            option-value="value" />
        </template>
      </DialogForm>
      <DataTable
        class="col-span-2"
        :value="factoryForm.jobStates"
        :pt="{
          header: {
            class: '!px-0',
          },
        }">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">서비스</span>
            <Button
              severity="primary"
              icon="pi pi-plus"
              @click="
                factoryForm.jobStates.push({
                  jobType: '',
                  lifetime: 0,
                  state: 'AVAILABLE',
                })
              "
              size="small"
              label="추가" />
          </div>
        </template>
        <Column class="text-center" header="번호">
          <template #body="slotProps">
            {{ slotProps.index + 1 }}
          </template>
        </Column>
        <Column class="!pl-0 text-center" field="jobType" header="작업유형">
          <template #body="{ data, field }">
            <Select
              v-model="data.jobType"
              :options="enumToLabelValue(JobTypesEnum)"
              fluid
              option-label="label"
              option-value="value"
              @change="handleJobStateChange" />
          </template>
        </Column>
        <Column class="!pl-0 text-center" field="state" header="상태">
          <template #body="{ data, field }">
            <Select
              v-model="data.state"
              :options="enumToLabelValue(JobTypesStateEnum)"
              fluid
              option-label="label"
              option-value="value" />
          </template>
        </Column>
        <Column class="text-center" field="lifetime" header="Timeout(ms)">
          <template #body="slotProps">
            {{ slotProps.data.lifetime }}
          </template>
        </Column>
        <Column class="text-center">
          <template #body="slotProps">
            <Button
              icon="pi pi-trash"
              severity="danger"
              outlined
              @click="factoryForm.jobStates.splice(slotProps.index, 1)" />
          </template>
        </Column>
      </DataTable>
      <DialogForm class="col-span-2" label="비고" :error="errors?.memo">
        <template #input>
          <Textarea
            id="memo"
            v-model="factoryForm.memo"
            rows="4"
            autocomplete="off"
            auto-resize>
          </Textarea>
        </template>
      </DialogForm>
    </form>
    <!-- 등록 버튼 -->
    <div class="mt-6 flex justify-center gap-4">
      <Button
        class="!h-10"
        v-if="isCreateMode"
        severity="primary"
        raised
        @click="createFactory">
        생성
      </Button>
      <template v-else>
        <Button class="!h-10" severity="warn" raised @click="updateFactory">
          수정
        </Button>
        <Button class="!h-10" severity="danger" raised @click="deleteFactory">
          삭제
        </Button>
      </template>
    </div>
  </div>
</template>
<style lang="scss" module></style>
