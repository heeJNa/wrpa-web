<script setup lang="ts">
  definePageMeta({
    layout: false,
  })
</script>

<template>
  <div
    class="bg-surface-50 dark:bg-surface-950 flex min-h-dvh w-full items-center justify-center overflow-y-auto p-4">
    <div class="flex w-full max-w-lg flex-col items-center justify-center">
      <div
        class="w-full rounded-[2rem] p-[0.3rem] sm:rounded-[56px]"
        style="
          background: linear-gradient(
            180deg,
            rgba(247, 149, 48, 0.4) 10%,
            rgba(247, 149, 48, 0) 30%
          );
        ">
        <div
          class="bg-surface-0 dark:bg-surface-900 flex w-full flex-col items-center rounded-[1.8rem] px-6 py-10 sm:rounded-[53px] sm:px-20 sm:py-20">
          <div class="flex flex-col items-center gap-4">
            <div
              class="flex items-center justify-center rounded-full border-2 border-orange-500"
              style="width: 3.2rem; height: 3.2rem">
              <i class="pi pi-fw pi-lock !text-2xl text-orange-500" />
            </div>
            <h1
              class="text-surface-900 dark:text-surface-0 mb-2 text-center text-2xl font-bold sm:text-4xl lg:text-5xl">
              접근이 거부되었습니다
            </h1>
            <span class="text-muted-color mb-8 text-center"
              >필요한 권한이 없습니다. 관리자에게 문의하십시오.</span
            >
            <img
              class="mb-8"
              src="/auth/asset-access.svg"
              alt="Access Denied"
              width="80%" />
            <div class="col-span-12 mt-8 text-center">
              <Button as="router-link" label="대시보드로 이동" to="/" severity="warn" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
