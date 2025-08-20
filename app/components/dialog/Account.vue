<script setup lang="ts">
  import { useAccountForm } from '~/composables/forms/useAccountForm'
  import { type Account } from '~/types/account'

  const { insuranceCompanyCodes, teams } = useGlobalData()
  const { request } = useClientAPI()
  const { account, errors, validate } = useAccountForm()
  const toast = useToast()

  const isCreateMode = ref(true)
  const dialogRef = inject<any>('dialogRef')
  onMounted(async () => {
    if (dialogRef.value?.data) {
      account.value = dialogRef.value.data as Account
      isCreateMode.value = false
    }
  })

  const createAccount = () => {
    if (validate()) {
      request(`/api/insure/accounts?companyId=${account.value.companyId}`, {
        method: 'POST',
        body: JSON.stringify(account.value),
      }).onFetchResponse(async (response) => {
        await fetchResponseHandler(
          response,
          dialogRef,
          toast,
          '계정이 생성되었습니다.',
          '계정 생성에 실패했습니다.',
        )
      })
    }
  }
  const updateAccount = async () => {
    if (validate()) {
      request(
        `/api/insure/accounts/${account.value.id}?companyId=${account.value.companyId}`,
        {
          method: 'PUT',
          body: JSON.stringify(account.value),
        },
      ).onFetchResponse(async (response) => {
        await fetchResponseHandler(
          response,
          dialogRef,
          toast,
          '계정이 수정되었습니다.',
          '계정 수정에 실패했습니다.',
        )
      })
    }
  }
  const deleteAccount = async () => {
    request(`/api/insure/accounts/${account.value.id}`, {
      method: 'DELETE',
    }).onFetchResponse(async (response) => {
      await fetchResponseHandler(
        response,
        dialogRef,
        toast,
        '계정이 삭제되었습니다.',
        '계정 삭제에 실패했습니다.',
      )
    })
  }
</script>
<template>
  <div class="w-full sm:w-[80vw] md:w-[50vw] lg:w-[35vw] xl:w-[25vw]">
    <form class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2" @submit.prevent>
      <!-- 회사명 -->
      <DialogForm label="회사명" :error="errors?.companyId" required>
        <template #input>
          <Select
            id="companyId"
            v-model="account.companyId"
            :options="teams"
            showClear
            :invalid="!!errors?.companyId"
            option-label="name"
            option-value="id" />
        </template>
      </DialogForm>
      <!-- 보험사 -->
      <DialogForm label="보험사" :error="errors?.insuranceCompanyCode" required>
        <template #input>
          <Select
            id="insuranceCompanyCode"
            v-model="account.insuranceCompanyCode"
            :options="insuranceCompanyCodes"
            showClear
            :invalid="!!errors?.insuranceCompanyCode"
            option-label="name"
            option-value="code" />
        </template>
      </DialogForm>

      <!-- 계정명 -->
      <DialogForm label="계정명" :error="errors?.name" required>
        <template #input>
          <InputText
            id="name"
            v-model="account.name"
            autocomplete="off"
            :invalid="!!errors?.name"
        /></template>
      </DialogForm>

      <!-- 인증코드 -->
      <DialogForm label="인증코드" :error="errors?.userCode">
        <template #input>
          <InputText id="userCode" v-model="account.userCode" autocomplete="off"
        /></template>
      </DialogForm>

      <!-- 아이디 -->
      <DialogForm label="아이디" :error="errors?.userId" required>
        <template #input>
          <InputText
            id="userId"
            v-model="account.userId"
            autocomplete="off"
            :invalid="!!errors?.userId"
        /></template>
      </DialogForm>

      <!-- 비밀번호 -->
      <DialogForm label="비밀번호" :error="errors?.userPw" required>
        <template #input>
          <InputText
            id="userPw"
            v-model="account.userPw"
            autocomplete="off"
            :invalid="!!errors?.userPw" />
        </template>
      </DialogForm>

      <!-- 그룹ID -->
      <DialogForm label="그룹ID" :error="errors?.groupId">
        <template #input>
          <InputText id="groupId" v-model="account.groupId" autocomplete="off" />
        </template>
      </DialogForm>

      <!-- 수수료지급일 -->
      <DialogForm label="수수료지급일" :error="errors?.paymentDayOfMonth">
        <template #input>
          <InputNumber
            id="paymentDayOfMonth"
            v-model="account.paymentDayOfMonth"
            :min="1"
            :max="31"
            autocomplete="off"
            show-buttons />
        </template>
      </DialogForm>

      <!-- 휴대폰번호 -->
      <DialogForm label="휴대폰번호" :error="errors?.userPhoneNumber">
        <template #input>
          <InputMask
            id="userPhoneNumber"
            v-model="account.userPhoneNumber"
            mask="999-9999-9999"
            unmask
            autocomplete="off" />
        </template>
      </DialogForm>

      <!-- 수수료비밀번호 -->
      <DialogForm label="수수료비밀번호" :error="errors?.feePassword">
        <template #input>
          <InputText
            v-model="account.feePassword"
            name="feePassword"
            autocomplete="off" />
        </template>
      </DialogForm>

      <!-- 통신사 -->
      <DialogForm label="통신사" :error="errors?.telecomAgency">
        <template #input>
          <RadioButtonGroup
            class="flex flex-wrap gap-4"
            id="telecomAgency"
            v-model="account.telecomAgency">
            <div class="flex items-center gap-2">
              <RadioButton inputId="skt" value="SKT" />
              <label for="skt">SKT</label>
            </div>
            <div class="flex items-center gap-2">
              <RadioButton inputId="kt" value="KT" />
              <label for="kt">KT</label>
            </div>
            <div class="flex items-center gap-2">
              <RadioButton inputId="lg" value="LG" />
              <label for="lg">LGU+</label>
            </div>
          </RadioButtonGroup>
        </template>
      </DialogForm>
      <DialogForm label="잠금" :error="errors?.lock" horizontal>
        <template #input>
          <Checkbox id="lock" v-model="account.lock" binary />
        </template>
      </DialogForm>
      <DialogForm class="col-span-2" label="비고" :error="errors?.note">
        <template #input>
          <Textarea
            id="note"
            v-model="account.note"
            rows="4"
            autocomplete="off"
            auto-resize />
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
        @click="createAccount">
        생성
      </Button>
      <template v-else>
        <Button class="!h-10" severity="warn" raised @click="updateAccount">
          수정
        </Button>
        <Button class="!h-10" severity="danger" raised @click="deleteAccount">
          삭제
        </Button>
      </template>
    </div>
  </div>
</template>
<style lang="scss" module></style>
