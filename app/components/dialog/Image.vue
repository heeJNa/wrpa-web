<script setup lang="ts">
  const dialogRef = inject<any>('dialogRef')

  const data = ref<any>()
  onMounted(() => {
    data.value = dialogRef.value?.data // {user: 'primetime'}
  })
</script>
<template>
  <img
    class="max-h-[80vh] max-w-full object-contain"
    v-if="data && data.bucketName && data.fileName"
    :src="`/api/system/files/${data.bucketName}/${data.fileName}`"
    alt="Image" />
  <div class="flex h-full items-center justify-center p-20" v-else>
    <p class="text-3xl text-gray-500">이미지가 없습니다.</p>
  </div>
</template>
<style lang="scss" module></style>
