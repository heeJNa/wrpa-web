import type { H3Event } from 'h3'

/**
 * 세션 쿠키 두 장.
 * - access_token: 접근 JWT(30분). 만료 임박 시 프록시가 refresh_token 으로 조용히 재발급한다
 * - refresh_token: 갱신 JWT(7일, 갱신마다 연장). 페이지 라우트 미들웨어도 로그인 여부 판단에 쓰므로 path 는 '/'
 * 둘 다 httpOnly — 브라우저 JS 는 읽을 수 없고, 서버 라우트(/api/**)만 다룬다.
 */
export const ACCESS_COOKIE = 'access_token'
export const REFRESH_COOKIE = 'refresh_token'

/** 접근 토큰 만료 전 이만큼 남았으면 미리 갱신한다(요청 중 만료로 401 나는 것을 피함) */
export const REFRESH_SKEW_SEC = 30

export interface JwtHolder {
  token: string
  expiresIn: number
}
export interface AuthResult {
  accessToken: JwtHolder
  refreshToken: JwtHolder | null
}

const cookieBase = { httpOnly: true, secure: false, sameSite: 'lax' as const, path: '/' }

function maxAgeFrom(expiresInMillis: number, fallbackSec: number): number {
  const sec = Math.floor((expiresInMillis - Date.now()) / 1000)
  return sec > 0 ? sec : fallbackSec
}

export function setSessionCookies(event: H3Event, auth: AuthResult) {
  setCookie(event, ACCESS_COOKIE, auth.accessToken.token, {
    ...cookieBase,
    maxAge: maxAgeFrom(auth.accessToken.expiresIn, 30 * 60),
  })
  if (auth.refreshToken?.token) {
    setCookie(event, REFRESH_COOKIE, auth.refreshToken.token, {
      ...cookieBase,
      maxAge: maxAgeFrom(auth.refreshToken.expiresIn, 7 * 24 * 60 * 60),
    })
  }
}

export function clearSessionCookies(event: H3Event) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) {
    setCookie(event, name, '', { ...cookieBase, expires: new Date(0) })
  }
}

/** JWT 의 exp(초) 를 서명 검증 없이 읽는다. 갱신 시점 판단용일 뿐 인증 판단에는 쓰지 않는다 */
export function jwtExpSeconds(token: string): number | null {
  const parts = token.split('.')
  const payloadPart = parts.length === 3 ? parts[1] : undefined
  if (!payloadPart) return null
  try {
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

/** 토큰이 없거나 형식이 깨졌거나 skew 초 안에 만료되면 true */
export function accessTokenNeedsRefresh(
  token: string | undefined,
  nowMillis = Date.now(),
  skewSec = REFRESH_SKEW_SEC,
): boolean {
  if (!token) return true
  const exp = jwtExpSeconds(token)
  if (exp === null) return true
  return exp * 1000 - nowMillis < skewSec * 1000
}

// 같은 갱신 토큰으로 동시에 들어온 요청(페이지 진입 시 API 여러 개)은 한 번만 회전시킨다.
// 각각 회전시키면 두 번째부터는 이미 폐기된 토큰이라 유예 창 밖에서는 가족 전체가 폐기된다.
const inflight = new Map<string, Promise<AuthResult | null>>()

export function refreshSession(
  rpaApiUrl: string,
  refreshToken: string,
  headers: Record<string, string> = {},
): Promise<AuthResult | null> {
  const existing = inflight.get(refreshToken)
  if (existing) return existing
  const p = (async (): Promise<AuthResult | null> => {
    try {
      const url = new URL('/api/auth/refresh', rpaApiUrl)
      return await $fetch<AuthResult>(url.toString(), {
        method: 'POST',
        body: { refreshToken },
        headers,
      })
    } catch {
      return null
    }
  })().finally(() => {
    inflight.delete(refreshToken)
  })
  inflight.set(refreshToken, p)
  return p
}
