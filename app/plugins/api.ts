export default defineNuxtPlugin((nuxtApp) => {
  const toast = useToast()

  const api = $fetch.create({
    // onRequest({ request }) {
    //   console.log('Sending request to ' + request)
    // },
    retryStatusCodes: [502, 503, 504],
    async onResponseError({ response }) {
      if (response.status === 401 || response.status === 403) {
        await $fetch('/api/auth/revoke').then(async () => {
          await nuxtApp.runWithContext(() => {
            const tokenState = useState('accessToken')
            tokenState.value = null;
            toast.add({
              severity: 'error',
              summary: '세션이 만료되었습니다. 다시 로그인해주세요.',
              life: 5000,
            })
            navigateTo('/login')
          })
        })
      } else if (
        response.status === 404
        || response.status === 400
        || response.status === 429
      ) {
        toast.add({ severity: 'warn', summary: response._data.message, life: 5000 })
      } else if (response.status === 500) {
        toast.add({ severity: 'error', summary: response._data.message, life: 5000 })
      } else {
        toast.add({
          severity: 'error',
          summary: 'An unexpected error occurred',
          life: 5000,
        })
      }
    },
  })

  // Expose to useNuxtApp().$api
  return {
    provide: {
      api,
    },
  }
})
