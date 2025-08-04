<template>
  <div>
    <Toast :base-z-index="999" />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
      <DynamicDialog />
    </NuxtLayout>
  </div>
</template>
<script setup lang="ts">
  const { insuranceCompanyCodes, teams } = useGlobalData()
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
      if (teams.value.length === 0) {
        const { data } = await request<any[]>('/api/auth/teams')
        teams.value = data.value || []
      }
    }
  })
</script>
