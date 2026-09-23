/**
 * 모바일(md 미만)에서 DataTable 을 '한 행 = 한 카드'로 세워 읽기 위한 PT.
 *
 * thead 를 감추면 값만 남아 무슨 항목인지 알 수 없으므로, 각 Column 의 header 를
 * td 의 data-label 로 옮겨 CSS(::before)가 찍게 한다. 실제 레이아웃 전환은
 * `app/assets/layout/_responsive.scss` 의 `.p-datatable-mobile-cards` 가 맡는다.
 *
 * PrimeVue 는 같은 PT 훅을 두 가지 모양(컨텍스트 중첩 / 평면)으로 호출하므로 둘 다 받는다.
 * 쓰는 쪽: `<DataTable class="p-datatable-mobile-cards" :pt="{ column: mobileCardColumnPT }">`
 */
export const mobileCardColumnPT = {
  bodyCell: (options: any) => ({
    'data-label': String(options?.props?.header ?? options?.column?.props?.header ?? ''),
  }),
}
