<script setup lang="ts"></script>

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
            rgba(233, 30, 99, 0.4) 10%,
            rgba(33, 150, 243, 0) 30%
          );
        ">
        <div
          class="bg-surface-0 dark:bg-surface-900 flex w-full flex-col items-center px-8 py-20 sm:px-20"
          style="border-radius: 53px">
          <div class="flex flex-col items-center gap-4">
            <div
              class="flex items-center justify-center rounded-full border-2 border-pink-500"
              style="height: 3.2rem; width: 3.2rem">
              <i class="pi pi-fw pi-exclamation-circle !text-2xl text-pink-500" />
            </div>
            <h1 class="text-surface-900 dark:text-surface-0 mb-2 text-5xl font-bold">
              Error Occured
            </h1>
            <span class="text-muted-color mb-8"
              >Requested resource is not available.</span
            >
            <img class="mb-8" src="/general/asset-error.svg" alt="Error" width="80%" />
            <div class="col-span-12 mt-8 text-center">
              <Button as="router-link" label="Go to Dashboard" to="/" severity="danger" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
