<template>
  <div>
    <Toast :base-z-index="999" />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
      <ConfirmDialog :pt="confirmPT" />
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

  const confirmPT = {
    content: {
      class: [
        'border-surface-200 dark:border-surface-700 flex w-full flex-col items-center gap-4 border-b pb-4 mb-4',
      ],
    },
    icon: {
      class: ['!text-4xl'],
    },
    message: {
      class: ['text-center whitespace-pre-wrap'],
    },
  }
</script>
