<template>
  <div>
    <Toast :base-z-index="999" />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup lang="ts">
  const { insuranceCompanyCodes } = useGlobalData()
  const { request } = useClientAPI()
  const { isLogin } = storeToRefs(useAuthStore())

  onMounted(async () => {
    if (isLogin.value) {
      if (insuranceCompanyCodes.value.length === 0) {
        const { data } = await request<InsuranceCompanyCode[]>(
          '/api/basic/insuranceCompanyCodes',
        )
        insuranceCompanyCodes.value = data.value || []
      }
    }
  })
</script>
