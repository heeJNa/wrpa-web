<script setup lang="ts">
  definePageMeta({
    layout: false,
  })
</script>

<template>
  <div
    class="bg-surface-50 dark:bg-surface-950 flex min-h-screen min-w-[100vw] items-center justify-center overflow-hidden">
    <div class="flex flex-col items-center justify-center">
      <div
        style="
          border-radius: 56px;
          padding: 0.3rem;
          background: linear-gradient(
            180deg,
            rgba(247, 149, 48, 0.4) 10%,
            rgba(247, 149, 48, 0) 30%
          );
        ">
        <div
          class="bg-surface-0 dark:bg-surface-900 flex w-full flex-col items-center px-8 py-20 sm:px-20"
          style="border-radius: 53px">
          <div class="flex flex-col items-center gap-4">
            <div
              class="flex items-center justify-center rounded-full border-2 border-orange-500"
              style="width: 3.2rem; height: 3.2rem">
              <i class="pi pi-fw pi-lock !text-2xl text-orange-500" />
            </div>
            <h1
              class="text-surface-900 dark:text-surface-0 mb-2 text-4xl font-bold lg:text-5xl">
              접근이 거부되었습니다
            </h1>
            <span class="text-muted-color mb-8"
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
