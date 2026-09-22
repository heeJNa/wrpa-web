<script setup lang="ts">
  import {
    UPLOAD_CATEGORIES,
    categoryLabel,
    type OrderRow,
  } from '~/types/business-day-order'

  const props = defineProps<{ row: OrderRow; index: number; invalid?: boolean }>()
  const emit = defineEmits<{ remove: [] }>()

  // 종료 영업일 "이후 전체" = bizDayTo null. 체크 해제 시 시작값으로 복원해 바로 편집 가능하게
  const openEnded = computed({
    get: () => props.row.bizDayTo === null,
    set: (v: boolean) => {
      props.row.bizDayTo = v ? null : props.row.bizDayFrom
    },
  })

  const excluded = computed(() =>
    UPLOAD_CATEGORIES.filter((c) => !props.row.order.includes(c.value)),
  )
  const addValue = ref<string | null>(null)

  const move = (i: number, delta: number) => {
    const j = i + delta
    if (j < 0 || j >= props.row.order.length) return
    const order = props.row.order
    ;[order[i], order[j]] = [order[j]!, order[i]!]
  }
  const exclude = (i: number) => props.row.order.splice(i, 1)
  const include = (value: string | null) => {
    if (value && !props.row.order.includes(value)) props.row.order.push(value)
    addValue.value = null
  }
</script>

<template>
  <div
    class="flex flex-col gap-2 rounded border p-3"
    :class="invalid ? 'border-red-400 bg-red-50/30' : ''">
    <div class="flex flex-wrap items-center gap-3">
      <span class="font-semibold">{{ index + 1 }}번째 구간</span>
      <label class="flex items-center gap-2">
        <span>시작 영업일</span>
        <InputNumber
          class="w-20"
          v-model="row.bizDayFrom"
          input-class="w-full"
          :min="1"
          :max="31"
          :use-grouping="false" />
      </label>
      <label class="flex items-center gap-2">
        <span>종료 영업일</span>
        <InputNumber
          class="w-20"
          v-model="row.bizDayTo"
          input-class="w-full"
          :min="1"
          :max="99"
          :use-grouping="false"
          :disabled="openEnded" />
      </label>
      <label class="flex items-center gap-2">
        <Checkbox v-model="openEnded" binary :input-id="`open-${index}`" />
        <span>이후 전체</span>
      </label>
      <Button
        class="ml-auto"
        label="구간 삭제"
        severity="danger"
        text
        @click="emit('remove')" />
    </div>

    <div class="flex max-w-3xl flex-col gap-1">
      <div
        class="bg-surface-50 flex items-center gap-2 rounded px-2 py-0.5"
        v-for="(value, i) in row.order"
        :key="value">
        <span class="w-6 text-right font-mono">{{ i + 1 }}</span>
        <span class="flex-1">{{ categoryLabel(value) }}</span>
        <Button
          icon="pi pi-arrow-up"
          size="small"
          text
          :disabled="i === 0"
          @click="move(i, -1)" />
        <Button
          icon="pi pi-arrow-down"
          size="small"
          text
          :disabled="i === row.order.length - 1"
          @click="move(i, 1)" />
        <Button label="제외" size="small" severity="secondary" text @click="exclude(i)" />
      </div>
      <div class="text-surface-500 px-2 py-1" v-if="row.order.length === 0">
        포함된 카테고리가 없습니다. 이 구간의 모든 작업은 작업일정의 우선순위를 그대로
        사용합니다.
      </div>
      <div class="flex items-center gap-2 pt-1" v-if="excluded.length">
        <Select
          class="w-48"
          v-model="addValue"
          :options="excluded"
          option-label="label"
          option-value="value"
          placeholder="카테고리 추가"
          @update:model-value="include" />
        <span class="text-surface-500 text-base"
          >제외된 카테고리: {{ excluded.map((c) => c.label).join(', ') }} — 이 구간에서는
          맨 뒤(가장 낮은 우선순위)로 처리됩니다.</span
        >
      </div>
    </div>
  </div>
</template>
