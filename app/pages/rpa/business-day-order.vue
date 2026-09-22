<script setup lang="ts">
  import {
    defaultOrderRows,
    invalidRowIndexes,
    validateOrderRows,
    type BusinessDayOrderPolicy,
    type OrderRow,
  } from '~/types/business-day-order'

  const { teams, insuranceCompanyCodes } = useGlobalData()
  const { request } = useClientAPI()
  const toast = useToast()

  const companyId = ref<string>('')
  const insuranceCompanyCode = ref<string | null>(null) // null = 회사 기본

  const policies = ref<BusinessDayOrderPolicy[]>([]) // 회사의 저장된 정책 전체
  const rows = ref<OrderRow[]>(defaultOrderRows())
  const enabled = ref<boolean>(false)
  const saving = ref(false)

  const cloneRows = (src: OrderRow[]): OrderRow[] =>
    src.map((r) => ({ ...r, order: [...r.order] }))
  const findPolicy = (code: string | null) =>
    policies.value.find((p) => (p.insuranceCompanyCode ?? null) === code)

  /** 현재 스코프에 저장된 정책이 있는지. 없으면 회사 기본(또는 시드)을 편집 중 */
  const scopeSaved = computed(() => !!findPolicy(insuranceCompanyCode.value))
  const companyDefaultSaved = computed(() => !!findPolicy(null))
  const insurerName = (code: string) =>
    insuranceCompanyCodes.value.find((i) => i.code === code)?.name ?? code
  /** 저장된 정책 목록(회사 기본 먼저). 보험사를 비웠을 때 전체를 카드로 보여준다 */
  const savedPolicies = computed(() =>
    [...policies.value]
      .sort((a, b) => (a.insuranceCompanyCode ? 1 : 0) - (b.insuranceCompanyCode ? 1 : 0))
      .map((p) => ({
        code: p.insuranceCompanyCode ?? null,
        title: p.insuranceCompanyCode ? insurerName(p.insuranceCompanyCode) : '회사 기본',
        rows: p.rows ?? [],
      })),
  )
  const editPolicy = async (code: string | null) => {
    insuranceCompanyCode.value = code
    await loadScope()
  }
  const errors = computed(() => validateOrderRows(rows.value))
  const invalidRows = computed(() => invalidRowIndexes(rows.value))

  const loadEnabled = async () => {
    const { data } = await request<{ enabled: boolean }>(
      `/api/business-day-order/enabled?companyId=${companyId.value}`,
      { method: 'GET' },
    )
    enabled.value = data.value?.enabled ?? false
  }

  const onToggleEnabled = () => {
    if (!companyId.value) return
    request(
      `/api/business-day-order/enabled?companyId=${companyId.value}&enabled=${enabled.value}`,
      { method: 'POST' },
    ).then(({ statusCode }) => {
      if (statusCode.value === 200) {
        toast.add({
          severity: 'success',
          summary: '성공',
          detail: '설정이 저장되었습니다.',
          life: 3000,
        })
      } else {
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

  /** 회사 정책 전체를 읽고 현재 스코프의 행을 채움. 스코프 정책 없음 → 회사 기본 → 시드 순 */
  const loadScope = async () => {
    if (!companyId.value) return
    await loadEnabled()
    const { data } = await request<BusinessDayOrderPolicy[]>(
      `/api/business-day-order?companyId=${companyId.value}`,
      { method: 'GET' },
    )
    policies.value = data.value ?? []
    const source = findPolicy(insuranceCompanyCode.value) ?? findPolicy(null)
    rows.value = source?.rows?.length ? cloneRows(source.rows) : defaultOrderRows()
  }

  const addRow = () => {
    const last = rows.value[rows.value.length - 1]
    const from = last ? (last.bizDayTo ?? last.bizDayFrom) + 1 : 1
    rows.value.push({ bizDayFrom: from, bizDayTo: null, order: [] })
  }
  const removeRow = (i: number) => rows.value.splice(i, 1)

  const save = async () => {
    if (errors.value.length) return
    saving.value = true
    try {
      const { statusCode, data } = await request<{ message?: string }>(
        `/api/business-day-order`,
        {
          method: 'POST',
          body: JSON.stringify({
            companyId: companyId.value,
            insuranceCompanyCode: insuranceCompanyCode.value,
            rows: rows.value,
          }),
        },
        { updateDataOnError: true },
      )
      if (statusCode.value === 200) {
        toast.add({
          severity: 'success',
          summary: '성공',
          detail: '저장되었습니다.',
          life: 3000,
        })
        await loadScope()
      } else {
        toast.add({
          severity: 'error',
          summary: '저장 실패',
          detail: data.value?.message ?? '저장에 실패했습니다.',
          life: 5000,
        })
      }
    } finally {
      saving.value = false
    }
  }
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="card !mb-0 flex flex-col gap-3 !p-4">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">영업일 순서정책</h2>
          <p class="text-surface-500">
            영업일 구간별로 업로드 카테고리의 실행 순서를 정합니다. 순서만 정하며, 작업
            생성 여부는 작업일정의 유효 영업일 범위가 결정합니다.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Select
            class="w-56"
            v-model="companyId"
            :options="teams"
            option-label="name"
            option-value="id"
            placeholder="회사 선택"
            showClear
            filter
            @change="loadScope" />
          <Select
            class="w-56"
            v-model="insuranceCompanyCode"
            :options="insuranceCompanyCodes"
            option-label="name"
            option-value="code"
            placeholder="보험사(비우면 회사 기본)"
            showClear
            filter
            @change="loadScope" />
          <Button
            label="불러오기"
            icon="pi pi-refresh"
            severity="secondary"
            :disabled="!companyId"
            @click="loadScope" />
        </div>
      </div>

      <div
        class="border-surface-200 dark:border-surface-700 flex flex-wrap items-center gap-3 border-t pt-3"
        v-if="companyId">
        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="enabled" input-id="enabled" @change="onToggleEnabled" />
          <label class="font-medium" for="enabled">이 회사에 영업일 순서 사용</label>
        </div>
        <span class="text-surface-500" v-if="!enabled">
          OFF: 기존 작업 동작 그대로 (정책은 저장만 되고 적용되지 않음)
        </span>
        <span class="text-orange-600" v-else>
          ON: 이 회사의 자동 생성 작업에 정책이 적용됩니다.
        </span>
      </div>
    </div>

    <template v-if="companyId">
      <Message
        v-if="insuranceCompanyCode && !scopeSaved"
        severity="info"
        :closable="false">
        이 보험사에는 전용 정책이 없어
        {{ companyDefaultSaved ? '회사 기본 정책' : '기본 시드' }}을(를) 보여주고
        있습니다. 저장하면 이 보험사 전용 정책이 생성됩니다.
      </Message>
      <Message
        v-else-if="!insuranceCompanyCode && !companyDefaultSaved"
        severity="info"
        :closable="false">
        회사 기본 정책이 아직 저장되지 않았습니다(기본 시드 표시 중).
      </Message>

      <div
        class="card !mb-0 flex flex-col gap-2 !p-4"
        v-if="!insuranceCompanyCode && savedPolicies.length">
        <h3 class="text-xl font-semibold">저장된 정책</h3>
        <div class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <BusinessDayOrderPolicyCard
            v-for="p in savedPolicies"
            :key="p.code ?? '__default'"
            :title="p.title"
            :rows="p.rows"
            :editing="p.code === null"
            @edit="editPolicy(p.code)" />
        </div>
      </div>

      <div class="card !mb-0 flex flex-col gap-3 !p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-xl font-semibold">
            {{
              insuranceCompanyCode
                ? `${insurerName(insuranceCompanyCode)} 전용 정책 편집`
                : '회사 기본 정책 편집'
            }}
          </h3>
          <Button
            label="기본값으로"
            icon="pi pi-undo"
            severity="secondary"
            text
            @click="rows = defaultOrderRows()" />
        </div>

        <BusinessDayOrderRow
          v-for="(row, i) in rows"
          :key="i"
          :row="row"
          :index="i"
          :invalid="invalidRows.has(i)"
          @remove="removeRow(i)" />

        <Message v-if="errors.length" severity="warn" :closable="false">
          <ul class="m-0 list-disc pl-4">
            <li v-for="e in errors" :key="e">{{ e }}</li>
          </ul>
        </Message>

        <div class="flex justify-between gap-2">
          <Button
            label="영업일 구간 추가"
            icon="pi pi-plus"
            severity="secondary"
            outlined
            @click="addRow" />
          <Button
            label="저장"
            icon="pi pi-check"
            :disabled="!companyId || errors.length > 0"
            :loading="saving"
            @click="save" />
        </div>
      </div>
    </template>
  </div>
</template>
