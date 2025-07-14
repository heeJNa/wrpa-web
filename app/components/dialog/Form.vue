<script setup lang="ts">

const {error,label, required} = defineProps<{
    error?: string[];
    label: string;
    required?: boolean;
}>();
</script>
<template>
    <div class='flex flex-col'>
        <label class="block font-semibold"><span v-if='required' class='text-red-500 text-sm mr-1'>*</span>{{label}}</label>
        <slot name='input' ></slot>
        <small class="p-error" v-if="error">{{ error[0] }}</small>
        </div>
</template>
<style lang="scss" module></style>