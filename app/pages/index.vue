<script setup>
  const onThrow = () => {
    throw createError({
      statusCode: 500,
      statusMessage: 'This is a test error',
      fatal: true,
    })
  }
</script>

<template>
  <div class="card">
    <h2>Main page</h2>
    <div class="my-8 flex flex-col gap-6">
      <h4>Nuxt - Vue Pages</h4>
      <div class="flex w-1/6 flex-wrap gap-6">
        <!-- <Button
          severity="contrast"
          as="router-link"
          to="/not-found"
          label="Not Found Page" /> -->
        <Button label="Throw Error" severity="danger" @click="onThrow" />
      </div>
      <h4 class="mt-10">Auth Pages</h4>

      <div class="flex w-1/6 flex-wrap gap-6">
        <Button
          severity="warn"
          as="router-link"
          to="/auth/access"
          label="Unauthorized Page" />
        <Button as="router-link" to="/login" label="Login Page" />
      </div>
      <h4 class="mt-10">Global Datas</h4>

      <div class="flex w-1/6 flex-wrap gap-6">
        <!-- {{ insuranceCompanyCodes.map((code) => code.name).join(', ') }} -->
      </div>
    </div>
  </div>
</template>
