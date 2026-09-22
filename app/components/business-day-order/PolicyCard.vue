<script setup lang="ts">
  import { categoryLabel, type OrderRow } from '~/types/business-day-order'

  // 저장된 정책 한 건의 읽기 전용 요약. 보험사를 비웠을 때 회사 기본 + 보험사 전용 정책을 나란히 보여준다
  defineProps<{ title: string; rows: OrderRow[]; editing?: boolean }>()
  const emit = defineEmits<{ edit: [] }>()

  const rangeLabel = (r: OrderRow) =>
    r.bizDayTo === null
      ? `${r.bizDayFrom}영업일 이후`
      : r.bizDayFrom === r.bizDayTo
        ? `${r.bizDayFrom}영업일`
        : `${r.bizDayFrom}~${r.bizDayTo}영업일`
</script>

<template>
  <div
    class="flex flex-col gap-2 rounded border p-3"
    :class="editing ? 'border-primary' : 'border-surface-200 dark:border-surface-700'">
    <div class="flex h-7 items-center justify-between gap-2">
      <span class="font-semibold">{{ title }}</span>
      <Tag v-if="editing" value="편집 중" severity="info" />
      <Button
        v-else
        label="편집"
        icon="pi pi-pencil"
        size="small"
        text
        @click="emit('edit')" />
    </div>
    <div class="text-surface-500" v-if="rows.length === 0">구간 없음</div>
    <div class="flex flex-wrap items-baseline gap-x-2" v-for="(r, i) in rows" :key="i">
      <span class="text-surface-500 w-32 shrink-0">{{ rangeLabel(r) }}</span>
      <span class="text-surface-400" v-if="r.order.length === 0">(비어 있음)</span>
      <span v-else>{{ r.order.map(categoryLabel).join(' → ') }}</span>
    </div>
  </div>
</template>
