<script setup lang="ts">
  import type { DataTableSortEvent } from 'primevue/datatable'
  import type { PageState } from 'primevue/paginator'
  import type { Account } from '~~/types/account'

  const { insuranceCompanyCodes } = useGlobalData()
  const nameLike = ref('')
  const userid = ref('')
  const lock = ref<boolean | null>(null)
  const page = ref(0)
  const size = ref(25)
  const sort = ref(['createdTime,desc'])
  const insuranceCompanyNameLike = ref('')
  const insureanceCode = ref('')
  // const filters = ref({
  //   companyName: { value: '', matchMode: 'contains' },
  // })
  // const getAccounts = async () => {
  const { data, execute } = await useLazyAPI<ListResponse<Account>>(
    // 'accounts',
    `/api/insure/accounts`,
    {
      query: {
        page: page,
        size: size,
        sort: sort,
        nameLike: nameLike,
        userid: userid,
        lock: lock,
        insureanceCode: insureanceCode,
        insuranceCompanyNameLike: insuranceCompanyNameLike,
      },
      watch: false,
    },
  )
  // }
  const onPage = async (event: PageState) => {
    page.value = event.page
    size.value = event.rows
    await execute()
  }
  // const onFilter = debounce((event: DataTableFilterEvent) => {}, 500)
  const onSort = async (event: DataTableSortEvent) => {
    if (!event.multiSortMeta) return
    const sortMeta = event.multiSortMeta.map((meta) => {
      return `${meta.field},${meta.order === 1 ? 'asc' : 'desc'}`
    })
    sort.value = sortMeta
    page.value = 0 // Reset to first page on sort
  }
</script>
<template>
  <div class="flex h-full w-full flex-col gap-2 overflow-hidden">
    <!-- <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold">계정 관리</h1>
      <div class="flex items-center gap-2">
        <Button
          class="!h-10 !px-4 !text-sm"
          label="새 계정 생성"
          severity="primary"
          as="router-link"
          to="/management/accounts/create" />
        <Button
          class="!h-10 !px-4 !text-sm"
          label="새 계정 생성"
          severity="secondary"
          as="router-link"
          to="/management/accounts/create" />
      </div>
    </div>
    <div class="mb-4 flex items-center gap-2">
      <InputText
        class="w-64"
        v-model="nameLike"
        type="text"
        placeholder="회사명 검색"
        @input="onPage({ page: 0, rows: size })" />
      <InputText
        class="w-64"
        v-model="userid"
        type="text"
        placeholder="아이디 검색"
        @input="onPage({ page: 0, rows: size })" />
      <Dropdown
        class="w-64"
        v-model="insureanceCode"
        :options="[]"
        option-label="name"
        option-value="code"
        placeholder="보험사 선택"
        @change="onPage({ page: 0, rows: size })" />
      <Dropdown
        class="w-64"
        v-model="lock"
        :options="[
          { label: '모두', value: null },
          { label: '활성', value: false },
          { label: '잠김', value: true },
        ]"
        option-label="label"
        option-value="value"
        placeholder="잠김 상태"
        @change="onPage({ page: 0, rows: size })" />
      <Button
        class="!h-10 !px-4 !text-sm"
        label="검색"
        severity="secondary"
        @click="onPage({ page: 0, rows: size })" />
      <Button
        class="!h-10 !px-4 !text-sm"
        label="초기화"
        severity="secondary"
        @click="
          () => {
            nameLike.value = ''
            userid.value = ''
            lock.value = null
            insureanceCode.value = ''
            onPage({ page: 0, rows: size })
          }
        " />
    </div>
    <div class="mb-4 text-red-500" v-if="error">
      <p>오류가 발생했습니다: {{ error.message }}</p>
      <p v-if="status">상태 코드: {{ status }}</p>
    </div>
    <div class="mb-4 text-gray-500" v-else-if="!data">
      <p>데이터를 불러오는 중...</p>
    </div>
    <div class="mb-4 text-gray-500" v-else-if="data?.values.length === 0">
      <p>검색 결과가 없습니다.</p>
    </div>
    <p class="mb-4 text-gray-500" v-else>
      총 {{ data?.pagingInfo?.totalElements ?? 0 }}개의 계정이 있습니다.
    </p>
    <p class="mb-4 text-gray-500">
      현재 페이지: {{ page + 1 }} /
      {{ Math.ceil(data?.pagingInfo?.totalElements / size) || 1 }}
    </p>
    <p class="mb-4 text-gray-500">페이지 크기: {{ size }}</p> -->
    <div>
      {{ convertMenuChainToString(getMenuChainFindByMenuPath(menus, $route.path)) }}
    </div>
    <div class="min-h-0">
      <DataTable
        :value="data?.values"
        dataKey="id"
        scrollable
        size="small"
        scroll-height="flex"
        lazy
        removable-sort
        sort-mode="multiple"
        resizableColumns
        columnResizeMode="fit"
        showGridlines
        @page="onPage"
        @sort="onSort">
        <!-- v-model:filters="filters"
        filterDisplay="row"
        @filter="onFilter" -->
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <IftaLabel>
                <InputText class="w-64" id="companyName" v-model="nameLike" type="text" />
                <label class="dark:text-surface-0" for="companyName">회사명</label>
              </IftaLabel>
              <IftaLabel>
                <InputText
                  class="w-64"
                  id="companyName"
                  v-model="insuranceCompanyNameLike"
                  type="text" />
                <label class="dark:text-surface-0" for="companyName">보험사</label>
              </IftaLabel>
              <IftaLabel>
                <InputText class="w-64" id="userid" v-model="userid" type="text" />
                <label class="dark:text-surface-0" for="userid">아이디</label>
              </IftaLabel>
              <IftaLabel>
                <Dropdown
                  class="w-64"
                  v-model="insureanceCode"
                  :options="insuranceCompanyCodes"
                  option-label="name"
                  option-value="code"
                  placeholder="보험사 선택" />
                <label class="dark:text-surface-0" for="insureanceCode">보험사</label>
              </IftaLabel>
              <IftaLabel>
                <Dropdown
                  class="w-64"
                  v-model="lock"
                  :options="[
                    { label: '전체', value: null },
                    { label: '활성', value: false },
                    { label: '잠김', value: true },
                  ]"
                  option-label="label"
                  option-value="value"
                  placeholder="전체" />
                <label class="dark:text-surface-0" for="lock">잠김 상태</label>
              </IftaLabel>
              <Button
                class="!px-4"
                label="검색"
                severity="primary"
                @click="() => execute()" />
            </div>
            <!-- <div class="flex items-center gap-2">
              <Button class="!h-10 !px-4" label="새 계정 생성" severity="primary" />
            </div> -->
          </div>
        </template>
        <Column class="text-center" header="번호">
          <template #body="slotProps">
            {{
              data?.pagingInfo?.totalElements
                ? data?.pagingInfo?.totalElements - page * size - slotProps.index
                : ''
            }}
          </template>
        </Column>
        <Column field="companyName" header="회사명" :show-filter-menu="false" sortable>
          <!-- <template #filter="{ filterModel, filterCallback }">
            <InputText
              v-model="filterModel.value"
              type="text"
              @input="filterCallback()"
              placeholder="Search by name" />
          </template> -->
        </Column>
        <Column field="insuranceCompanyName" header="보험사" sortable></Column>
        <Column field="userId" header="아이디"></Column>
        <Column class="text-center" field="lock" header="잠김">
          <template #body="slotProps">
            <Badge
              size="large"
              :value="slotProps.data.lock ? '잠김' : '활성'"
              :severity="slotProps.data.lock ? 'danger' : 'success'"></Badge>
          </template>
        </Column>
        <template #footer>
          <div class="flex items-center justify-between">
            <span class="text-gray-500">
              총 검색결과: {{ data?.pagingInfo?.totalElements ?? 0 }}건
            </span>
            <Paginator
              :rows="size"
              :total-records="data?.pagingInfo?.totalElements ?? 0"
              :page-link-size="5"
              :rows-per-page-options="[25, 50, 100]"
              @page="onPage" />
          </div>
        </template>
      </DataTable>
    </div>
  </div>
  <!--  -->
</template>
