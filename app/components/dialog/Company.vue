<script setup lang="ts">
  import { useCompanyForm } from '~/composables/forms/useCompanyForm'
  import type { Company } from '~/types/company'

  const { request } = useClientAPI()
  const { companyForm, errors, validate } = useCompanyForm()
  const toast = useToast()
  const confirm = useConfirm()

  const dialogRef = inject<any>('dialogRef')
  const isCreateMode = ref(true)
  const companyId = ref<string>()

  onMounted(() => {
    const company = dialogRef.value?.data as Company | undefined
    if (company) {
      companyId.value = company.id
      companyForm.value = {
        name: company.name,
        code: company.code,
        branchName: company.branchName,
        branchUse: company.branchUse ?? false,
        businessRegistrationNumber: company.businessRegistrationNumber,
        companyRegistrationNumber: company.companyRegistrationNumber,
        address: company.address,
        addressDetail: company.addressDetail,
        leaderName: company.leaderName,
        mainBank: company.mainBank,
        phone: company.phone,
        fax: company.fax,
        contractDate: company.contractDate,
        nextPaymentDate: company.nextPaymentDate,
      }
      isCreateMode.value = false
    }
  })

  // 문자열은 trim 하고 빈 값은 null 로 보낸다 — 백엔드 코드 중복 검사가 exact match 이고, '' 가 저장되지 않게
  const toBody = () => {
    const body: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(companyForm.value)) {
      body[key] = typeof value === 'string' ? value.trim() || null : value
    }
    return JSON.stringify(body)
  }

  const createCompany = () => {
    if (validate()) {
      request(`/api/companies`, {
        method: 'POST',
        body: toBody(),
      }).onFetchResponse(async (response) => {
        await fetchResponseHandler(
          response,
          dialogRef,
          toast,
          '회사가 생성되었습니다.',
          '회사 생성에 실패했습니다. 고유코드가 중복되었는지 확인해주세요.',
        )
      })
    }
  }
  const updateCompany = () => {
    if (validate()) {
      request(`/api/companies/${companyId.value}`, {
        method: 'PUT',
        body: toBody(),
      }).onFetchResponse(async (response) => {
        await fetchResponseHandler(
          response,
          dialogRef,
          toast,
          '회사가 수정되었습니다.',
          '회사 수정에 실패했습니다.',
        )
      })
    }
  }
  const deleteCompany = () => {
    confirm.require({
      group: 'company-delete',
      message: `'${companyForm.value.name}' 회사를 정말로 삭제하시겠습니까?\n소속 사용자와 계정은 더 이상 이 회사로 조회되지 않습니다.`,
      header: '회사 삭제',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '삭제',
      acceptProps: { severity: 'danger' },
      rejectProps: { label: '취소', severity: 'secondary', outlined: true },
      accept: () => {
        request(`/api/companies/${companyId.value}`, {
          method: 'DELETE',
        }).onFetchResponse(async (response) => {
          await fetchResponseHandler(
            response,
            dialogRef,
            toast,
            '회사가 삭제되었습니다.',
            '회사 삭제에 실패했습니다.',
          )
        })
      },
    })
  }
</script>
<template>
  <div class="w-full sm:w-[80vw] md:w-[60vw] lg:w-[45vw] xl:w-[35vw]">
    <form class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2" @submit.prevent>
      <DialogForm label="회사명" :error="errors?.name" required>
        <template #input>
          <InputText
            id="name"
            v-model="companyForm.name"
            autocomplete="off"
            :invalid="!!errors?.name" />
        </template>
      </DialogForm>
      <DialogForm label="고유코드 (생성 후 변경 불가)" :error="errors?.code" required>
        <template #input>
          <InputText
            id="code"
            v-model="companyForm.code"
            autocomplete="off"
            :disabled="!isCreateMode"
            :invalid="!!errors?.code" />
        </template>
      </DialogForm>
      <DialogForm label="대표자" :error="errors?.leaderName">
        <template #input>
          <InputText
            id="leaderName"
            v-model="companyForm.leaderName"
            autocomplete="off" />
        </template>
      </DialogForm>
      <DialogForm label="주거래 은행" :error="errors?.mainBank">
        <template #input>
          <InputText id="mainBank" v-model="companyForm.mainBank" autocomplete="off" />
        </template>
      </DialogForm>
      <DialogForm label="사업자 등록번호" :error="errors?.businessRegistrationNumber">
        <template #input>
          <InputText
            id="businessRegistrationNumber"
            v-model="companyForm.businessRegistrationNumber"
            autocomplete="off" />
        </template>
      </DialogForm>
      <DialogForm label="법인 등록번호" :error="errors?.companyRegistrationNumber">
        <template #input>
          <InputText
            id="companyRegistrationNumber"
            v-model="companyForm.companyRegistrationNumber"
            autocomplete="off" />
        </template>
      </DialogForm>
      <DialogForm label="전화번호" :error="errors?.phone">
        <template #input>
          <InputText id="phone" v-model="companyForm.phone" autocomplete="off" />
        </template>
      </DialogForm>
      <DialogForm label="팩스" :error="errors?.fax">
        <template #input>
          <InputText id="fax" v-model="companyForm.fax" autocomplete="off" />
        </template>
      </DialogForm>
      <DialogForm class="md:col-span-2" label="주소" :error="errors?.address">
        <template #input>
          <InputText id="address" v-model="companyForm.address" autocomplete="off" />
        </template>
      </DialogForm>
      <DialogForm class="md:col-span-2" label="주소 상세" :error="errors?.addressDetail">
        <template #input>
          <InputText
            id="addressDetail"
            v-model="companyForm.addressDetail"
            autocomplete="off" />
        </template>
      </DialogForm>
      <DialogForm label="지사명" :error="errors?.branchName">
        <template #input>
          <InputText
            id="branchName"
            v-model="companyForm.branchName"
            autocomplete="off" />
        </template>
      </DialogForm>
      <DialogForm label="지사 사용" :error="errors?.branchUse">
        <template #input>
          <div class="flex h-10 items-center">
            <ToggleSwitch id="branchUse" v-model="companyForm.branchUse" />
          </div>
        </template>
      </DialogForm>
      <DialogForm label="계약일" :error="errors?.contractDate">
        <template #input>
          <InputText
            id="contractDate"
            v-model="companyForm.contractDate"
            placeholder="YYYY-MM-DD"
            autocomplete="off"
            :invalid="!!errors?.contractDate" />
        </template>
      </DialogForm>
      <DialogForm label="다음결제일" :error="errors?.nextPaymentDate">
        <template #input>
          <InputText
            id="nextPaymentDate"
            v-model="companyForm.nextPaymentDate"
            placeholder="YYYY-MM-DD"
            autocomplete="off"
            :invalid="!!errors?.nextPaymentDate" />
        </template>
      </DialogForm>
    </form>
    <div class="mt-6 flex justify-center gap-4">
      <Button
        class="!h-10"
        v-if="isCreateMode"
        severity="primary"
        raised
        @click="createCompany">
        생성
      </Button>
      <template v-else>
        <Button class="!h-10" severity="warn" raised @click="updateCompany">
          수정
        </Button>
        <Button class="!h-10" severity="danger" raised @click="deleteCompany">
          삭제
        </Button>
      </template>
    </div>
    <ConfirmDialog group="company-delete" :pt="confirmPT" />
  </div>
</template>
<style lang="scss" module></style>
