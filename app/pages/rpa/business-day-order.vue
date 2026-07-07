<script setup lang="ts">
  import {
    UPLOAD_CATEGORIES,
    categoryLabel,
    type OrderRow,
  } from '~/types/business-day-order'

  const { teams, insuranceCompanyCodes } = useGlobalData()
  const { request } = useClientAPI()
  const toast = useToast()

  const companyId = ref<string>('')
  const insuranceCompanyCode = ref<string | null>(null) // null = 회사 기본

  // 기본 순서표(신규 스코프의 시드)
  const defaultRows = (): OrderRow[] => [
    {
      bizDayFrom: 1,
      bizDayTo: 2,
      order: ['PREV_NEW', 'CUR_NEW', 'PREV_CONT', 'CUR_CONT'],
    },
    {
      bizDayFrom: 3,
      bizDayTo: 3,
      order: ['CUR_NEW', 'PREV_NEW', 'PREV_CONT', 'CUR_CONT'],
    },
    {
      bizDayFrom: 4,
      bizDayTo: 5,
      order: ['CUR_NEW', 'PREV_NEW', 'CUR_CONT', 'PREV_CONT'],
    },
    { bizDayFrom: 6, bizDayTo: null, order: ['CUR_NEW', 'CUR_CONT'] },
  ]

  const rows = ref<OrderRow[]>(defaultRows())
  const enabled = ref<boolean>(false)

  const loadEnabled = async () => {
    if (!companyId.value) return
    const { data } = await request<{ enabled: boolean }>(
      `/api/business-day-order/enabled?companyId=${companyId.value}`,
      {
        method: 'GET',
      },
    )
    enabled.value = data.value?.enabled ?? false
  }

  const onToggleEnabled = () => {
    if (!companyId.value) return
    request(
      `/api/business-day-order/enabled?companyId=${companyId.value}&enabled=${enabled.value}`,
      {
        method: 'POST',
      },
    ).then(({ statusCode }) => {
      if (statusCode.value === 200)
        toast.add({
          severity: 'success',
          summary: '성공',
          detail: '설정이 저장되었습니다.',
          life: 3000,
        })
      else {
        toast.add({
          severity: 'error',
          summary: '오류',
          detail: '설정 저장에 실패했습니다.',
          life: 3000,
        })
        enabled.value = !enabled.value
      }
    })
  }

  const loadScope = async () => {
    if (!companyId.value) return
    await loadEnabled()
    const { data } = await request<any>(
      `/api/business-day-order?companyId=${companyId.value}`,
      {
        method: 'GET',
      },
    )
    const list = (data.value ?? []) as any[]
    const match = list.find(
      (p) => (p.insuranceCompanyCode ?? null) === insuranceCompanyCode.value,
    )
    rows.value = match?.rows?.length
      ? match.rows.map((r: any) => ({ ...r }))
      : defaultRows()
  }

  const addRow = () =>
    rows.value.push({
      bizDayFrom: 1,
      bizDayTo: null,
      order: UPLOAD_CATEGORIES.map((c) => c.value),
    })
  const removeRow = (i: number) => rows.value.splice(i, 1)

  const save = () => {
    const body = {
      companyId: companyId.value,
      insuranceCompanyCode: insuranceCompanyCode.value,
      rows: rows.value,
    }
    request(`/api/business-day-order`, {
      method: 'POST',
      body: JSON.stringify(body),
    }).then(({ statusCode }) => {
      if (statusCode.value === 200)
        toast.add({
          severity: 'success',
          summary: '성공',
          detail: '저장되었습니다.',
          life: 3000,
        })
      else
        toast.add({
          severity: 'error',
          summary: '오류',
          detail: '저장에 실패했습니다.',
          life: 3000,
        })
    })
  }
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="flex flex-wrap items-center gap-3">
      <Select
        v-model="companyId"
        :options="teams"
        option-label="name"
        option-value="id"
        placeholder="회사 선택"
        showClear
        @change="loadScope" />
      <Select
        v-model="insuranceCompanyCode"
        :options="insuranceCompanyCodes"
        option-label="name"
        option-value="code"
        placeholder="보험사(비우면 회사 기본)"
        showClear
        @change="loadScope" />
      <Button label="불러오기" severity="secondary" @click="loadScope" />
      <Button label="기본값으로" text @click="rows = defaultRows()" />
    </div>

    <div class="flex flex-col gap-1 rounded border p-3" v-if="companyId">
      <div class="flex items-center gap-2">
        <ToggleSwitch v-model="enabled" input-id="enabled" @change="onToggleEnabled" />
        <label for="enabled">이 회사에 영업일 순서 사용</label>
      </div>
      <small class="text-surface-500" v-if="!enabled"
        >OFF: 기존 작업 동작 그대로 (신규 순서 미적용)</small
      >
    </div>

    <div class="flex flex-col gap-2 rounded border p-3" v-for="(row, i) in rows" :key="i">
      <div class="flex items-center gap-2">
        <span>영업일</span>
        <InputNumber class="w-24" v-model="row.bizDayFrom" :min="1" :max="31" />
        <span>~</span>
        <InputNumber
          class="w-24"
          v-model="row.bizDayTo"
          :min="1"
          :max="99"
          placeholder="이후 전체"
          showClear />
        <Button
          label="행 삭제"
          size="small"
          severity="danger"
          text
          @click="removeRow(i)" />
      </div>
      <OrderList v-model="row.order" data-key="." list-style="height:auto">
        <template #option="{ option }">{{ categoryLabel(option) }}</template>
      </OrderList>
      <small class="text-surface-500"
        >위에 있을수록 먼저 실행(높은 우선순위). 여기 없는 카테고리는 맨 뒤로.</small
      >
    </div>

    <div class="flex gap-2">
      <Button label="+ 영업일 구간 추가" severity="secondary" @click="addRow" />
      <Button label="저장" :disabled="!companyId" @click="save" />
    </div>
  </div>
</template>
