<script setup lang="ts"></script>

<template>
  <div class="flex min-h-screen items-center justify-center overflow-hidden">
    <div class="flex flex-col items-center justify-center">
      <div
        style="
          border-radius: 56px;
          padding: 0.3rem;
          background: linear-gradient(
            180deg,
            color-mix(in srgb, var(--primary-color), transparent 60%) 10%,
            var(--surface-ground) 30%
          );
        ">
        <div
          class="bg-surface-0 dark:bg-surface-900 flex w-full flex-col items-center px-8 py-20 sm:px-20"
          style="border-radius: 53px">
          <span class="text-primary text-3xl font-bold">404</span>
          <h1
            class="text-surface-900 dark:text-surface-0 mb-2 text-3xl font-bold lg:text-5xl">
            페이지를 찾을 수 없습니다
          </h1>
          <div class="text-surface-600 dark:text-surface-200 mb-8">
            요청한 리소스를 사용할 수 없습니다.
          </div>
          <router-link
            class="border-surface-300 dark:border-surface-500 flex w-full items-center border-b py-8"
            to="/">
            <span
              class="border-primary text-primary rounded-border flex items-center justify-center border-2"
              style="height: 3.5rem; width: 3.5rem">
              <i class="pi pi-fw pi-table !text-2xl" />
            </span>
            <span class="ml-6 flex flex-col">
              <span
                class="text-surface-900 dark:text-surface-0 mb-0 block font-medium lg:text-xl"
                >Frequently Asked Questions</span
              >
              <span class="text-surface-600 dark:text-surface-200 lg:text-xl"
                >Ultricies mi quis hendrerit dolor.</span
              >
            </span>
          </router-link>
          <router-link
            class="border-surface-300 dark:border-surface-500 flex w-full items-center border-b py-8"
            to="/">
            <span
              class="border-primary text-primary rounded-border flex items-center justify-center border-2"
              style="height: 3.5rem; width: 3.5rem">
              <i class="pi pi-fw pi-question-circle !text-2xl" />
            </span>
            <span class="ml-6 flex flex-col">
              <span
                class="text-surface-900 dark:text-surface-0 mb-0 font-medium lg:text-xl"
                >Solution Center</span
              >
              <span class="text-surface-600 dark:text-surface-200 lg:text-xl"
                >Phasellus faucibus scelerisque eleifend.</span
              >
            </span>
          </router-link>
          <router-link
            class="border-surface-300 dark:border-surface-500 mb-8 flex w-full items-center border-b py-8"
            to="/">
            <span
              class="border-primary text-primary rounded-border flex items-center justify-center border-2"
              style="height: 3.5rem; width: 3.5rem">
              <i class="pi pi-fw pi-unlock !text-2xl" />
            </span>
            <span class="ml-6 flex flex-col">
              <span
                class="text-surface-900 dark:text-surface-0 mb-0 font-medium lg:text-xl"
                >Permission Manager</span
              >
              <span class="text-surface-600 dark:text-surface-200 lg:text-xl"
                >Accumsan in nisl nisi scelerisque</span
              >
            </span>
          </router-link>
          <Button as="router-link" label="대시보드로 이동" to="/" />
        </div>
      </div>
    </div>
  </div>
</template>
