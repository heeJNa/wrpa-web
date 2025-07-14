<script setup lang="ts">
  import { useAccountForm } from '~/composables/forms/useAccountForm'

  const { insuranceCompanyCodes, teams } = useGlobalData()
  const { request } = useClientAPI()
  const {
    errors,
    feePassword,
    groupId,
    id,
    insuranceCompanyCode,
    lock,
    name,
    note,
    paymentDayOfMonth,
    telecomAgency,
    userCode,
    userId,
    userPhoneNumber,
    userPw,
    companyId,
    validate,
  } = useAccountForm()
  const createAccount = async () => {
    if (validate()) {
      const { data } = await request(
        `/api/insure/accounts?companyId=${companyId.value}`,
        {
          method: 'POST',
          body: JSON.stringify({
            feePassword: feePassword.value,
            groupId: groupId.value,
            id: id.value,
            insuranceCompanyCode: insuranceCompanyCode.value,
            lock: lock.value,
            name: name.value,
            note: note.value,
            paymentDayOfMonth: paymentDayOfMonth.value,
            telecomAgency: telecomAgency.value,
            userCode: userCode.value,
            userId: userId.value,
            userPhoneNumber: userPhoneNumber.value,
            userPw: userPw.value,
          }),
        },
      )
    }
  }
</script>
<template>
  <div>
    <form class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2" @submit.prevent>
      <!-- 회사명 -->
      <DialogForm label="회사명" :error="errors?.companyId" required>
        <template #input>
          <Select
            class="w-full"
            id="insuranceCompanyCode"
            v-model="companyId"
            :options="teams"
            showClear
            option-label="name"
            option-value="id" />
        </template>
      </DialogForm>
      <!-- 보험사 -->
      <DialogForm label="보험사" :error="errors?.insuranceCompanyCode" required>
        <template #input>
          <Select
            class="w-full"
            id="insuranceCompanyCode"
            v-model="insuranceCompanyCode"
            :options="insuranceCompanyCodes"
            showClear
            option-label="name"
            option-value="code" />
        </template>
      </DialogForm>

      <!-- 계정명 -->
      <DialogForm label="계정명" :error="errors?.name" required>
        <template #input>
          <InputText id="name" v-model="name" autocomplete="off"
        /></template>
      </DialogForm>

      <!-- 인증코드 -->
      <DialogForm label="인증코드" :error="errors?.userCode">
        <template #input>
          <InputText id="userCode" v-model="userCode" autocomplete="off"
        /></template>
      </DialogForm>

      <!-- 아이디 -->
      <DialogForm label="아이디" :error="errors?.userId" required>
        <template #input>
          <InputText id="userId" v-model="userId" autocomplete="off"
        /></template>
      </DialogForm>

      <!-- 비밀번호 -->
      <DialogForm label="비밀번호" :error="errors?.userPw" required>
        <template #input>
          <InputText id="userPw" v-model="userPw" autocomplete="off" />
        </template>
      </DialogForm>

      <!-- 그룹ID -->
      <DialogForm label="그룹ID" :error="errors?.groupId">
        <template #input>
          <InputText id="groupId" v-model="groupId" autocomplete="off" />
        </template>
      </DialogForm>

      <!-- 수수료지급일 -->
      <DialogForm label="수수료지급일" :error="errors?.paymentDayOfMonth">
        <template #input>
          <InputNumber
            id="paymentDayOfMonth"
            v-model="paymentDayOfMonth"
            autocomplete="off"
            show-buttons />
        </template>
      </DialogForm>

      <!-- 휴대폰번호 -->
      <DialogForm label="휴대폰번호" :error="errors?.userPhoneNumber">
        <template #input>
          <InputMask
            id="userPhoneNumber"
            v-model="userPhoneNumber"
            mask="999-9999-9999"
            autocomplete="off" />
        </template>
      </DialogForm>

      <!-- 수수료비밀번호 -->
      <DialogForm label="수수료비밀번호" :error="errors?.feePassword">
        <template #input>
          <InputText v-model="feePassword" name="feePassword" autocomplete="off" />
        </template>
      </DialogForm>

      <!-- 통신사 -->
      <DialogForm label="통신사" :error="errors?.telecomAgency">
        <template #input>
          <RadioButtonGroup
            class="flex flex-wrap gap-4"
            id="telecomAgency"
            v-model="telecomAgency">
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
    </form>
    <!-- 등록 버튼 -->
    <div class="mt-6 flex justify-center">
      <Button class="!h-10" severity="primary" raised @click="createAccount">
        생성
      </Button>
    </div>
  </div>
</template>
<style lang="scss" module></style>
