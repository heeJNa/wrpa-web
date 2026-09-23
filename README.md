# WRPA Web

WRPA를 관리하기 위한 Admin 페이지입니다.

Nuxt 3.17.6(Nuxt 4 호환 모드) + PrimeVue 4 + TailwindCSS 4 + Pinia + Zod 4.
UI는 [Sakai Nuxt Starter](https://github.com/j0rgedev/sakai-nuxt-starter)를 바탕으로 커스터마이즈했습니다.

## 개발 환경

패키지 매니저는 **pnpm 전용**입니다(`packageManager: pnpm@10.12.4`).
`npm install`·`yarn` 을 돌리면 `node_modules` 가 pnpm 트리와 섞여 빌드가 깨지므로
쓰지 마세요(아래 *문제 해결* 참고). 두 매니저의 락파일은 `.gitignore` 로 막아 뒀고,
추적하는 락파일은 `pnpm-lock.yaml` 하나입니다.

```bash
pnpm install
pnpm dev          # http://localhost:3100  (3000 아님)
```

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 (포트 **3100**) |
| `pnpm build` | 프로덕션 빌드 → `.output/` |
| `pnpm preview` | 빌드 결과 미리보기 |
| `pnpm typecheck` | `nuxt typecheck` |
| `pnpm lint` / `pnpm lint:fix` | ESLint |

### 백엔드 연결

서버 라우트가 catch-all 프록시(`server/api/[...].ts`, `server/api/auth/`)로 동작하며,
`access_token` 쿠키를 Bearer 헤더로 바꿔 RPA API에 전달합니다.

| 런타임 설정 | 기본값 | 환경변수 |
| --- | --- | --- |
| `rpaApiUrl` | `http://localhost:9998` | `NUXT_RPA_API_URL` |
| `rpaAuthApiUrl` | `http://localhost:9991` | `NUXT_RPA_AUTH_API_URL` |

로컬에서 다른 백엔드를 보려면 `.env`에 `NUXT_RPA_API_URL`을 적습니다.
`.env`는 git·도커 빌드 컨텍스트 양쪽에서 제외됩니다.

## 배포

`deploy.sh`가 Docker 이미지를 빌드하고 컨테이너를 교체합니다.
**소스를 가져오지는 않으므로 서버에서 `git pull`을 먼저 해야 합니다.**

```bash
git pull
./deploy.sh                                   # 이 머신에서 빌드 + 교체
./deploy.sh <USER> <HOST>                     # 로컬 빌드 → scp 업로드 → 원격 교체
```

이미지는 **커밋 해시와 `latest` 두 개로 태그**됩니다(예: `wrpa-app:247b1c1`).
그래서 새로 올린 판이 문제가 있으면 빌드 없이 되돌릴 수 있습니다.

```bash
./deploy.sh --list                            # 지금 떠 있는 판 + 되돌릴 수 있는 태그
./deploy.sh --rollback 247b1c1                # 그 태그로 교체
./deploy.sh --list <USER> <HOST>              # 원격도 동일
./deploy.sh --rollback 247b1c1 <USER> <HOST>
```

- 태그는 최신 5개만 남기고 정리합니다. 단 **지금 떠 있는 판의 태그는 항상 남습니다**.
- 커밋되지 않은 변경이 있으면 태그에 `-dirty`가 붙고 경고가 나옵니다(같은 이름으로 덮어씀).
- 없는 태그로 롤백을 걸면 돌던 컨테이너를 내리지 않고 중단합니다.

기본값은 환경변수로 덮을 수 있습니다 — 스테이징·리허설에 같은 스크립트를 씁니다.

```bash
DEPLOY_CONTAINER=wrpa-app-staging DEPLOY_PORT=3001 ./deploy.sh
```

| 변수 | 기본값 |
| --- | --- |
| `DEPLOY_IMAGE` / `DEPLOY_CONTAINER` | `wrpa-app` |
| `DEPLOY_PORT` | `3000` |
| `DEPLOY_NETWORK` | `woori-net` |
| `DEPLOY_KEEP` | `5` |

### 컨테이너 런타임

`Dockerfile`은 멀티스테이지로, 이미지 안에서 `pnpm install --frozen-lockfile` 후
빌드합니다. 로컬 `node_modules`는 `.dockerignore`로 제외되므로 영향을 주지 않습니다.
운영 환경변수는 `ecosystem.config.cjs`에 들어 있어 이미지에 함께 포함됩니다.

```js
NUXT_RPA_API_URL:      'http://woori-rpa-master:9998'
NUXT_RPA_AUTH_API_URL: 'http://woori-auth:9991'
```

`docker run --network=woori-net`으로 붙기 때문에 위 호스트명이 해석됩니다.
컨테이너 내부 포트는 3000이고 pm2(`pm2-runtime`)로 기동합니다.

## 코드 규칙

- **API 호출** — SSR은 `useAPI()`(`useFetch` 래퍼), 클라이언트 전용 동작은 `useClientAPI()`,
  지연 로딩은 `useLazyAPI()`.
- **폼** — `app/composables/forms/use*Form.ts` + `useFormValidator.ts` 조합. PrimeVue 테마는 `app/theme/`.
- **목록 화면** — `ListDataTable`(`app/components/ListDataTable.vue`)을 씁니다. 필터는 `#filters`,
  열은 `#columns` 슬롯.
- **반응형** — md(768px) 미만에서 목록 표는 '한 행 = 한 카드'로 세워 읽습니다.
  `ListDataTable`은 자동 적용되고, **DataTable을 직접 쓸 때는 두 가지를 같이 붙여야 합니다.**

  ```vue
  <DataTable class="p-datatable-mobile-cards" :pt="{ column: mobileCardColumnPT }">
  ```

  실제 레이아웃 전환 규칙은 `app/assets/layout/_responsive.scss`에 있습니다.
  다이얼로그는 모바일에서 전체 화면으로 열립니다(확인창 `p-confirmdialog`은 제외).
- **차트 색** — `app/utils/dashboardChart.ts`의 `chartColors(dark)`만 씁니다. chart.js는 canvas라
  CSS 변수를 못 읽어 PrimeVue primary 토큰 값을 하드코딩해 둔 것이라,
  `app/theme/app-theme.ts`의 primary를 바꾸면 이 파일도 같이 고쳐야 합니다.

## 문제 해결

**`pnpm build`가 `Entry module ... cannot be external`로 실패**

로컬 `node_modules`에 npm이 설치한 패키지가 섞인 상태입니다. 클라이언트는 pnpm 쪽 vite로,
SSR은 다른 버전의 vite로 빌드되면서 깨집니다. 확인·복구:

```bash
ls -l node_modules/vite            # 심링크가 아니라 실제 디렉터리면 npm 이 설치한 것
rm -rf node_modules && pnpm install
```

락파일(`pnpm-lock.yaml`)은 정상이므로 Docker 빌드는 영향을 받지 않습니다.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Acknowledgements

- Thanks to the creators of the [Sakai Vue](https://github.com/primefaces/sakai-vue) template for the original design and inspiration.
- Special Thanks to the creator of the [Sakai Nuxt Starter](https://github.com/j0rgedev/sakai-nuxt-starter) template for customizing the Sakai Vue template for Nuxt.js.
