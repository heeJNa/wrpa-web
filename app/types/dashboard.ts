export interface StateCounts {
  total: number
  success: number
  fail: number
  waiting: number
  cancel: number
  working: number
  etc: number
  failRate: number
}

export interface CompanyStat {
  companyId: string | null
  companyName: string
  counts: StateCounts
}

export interface InsurerStat {
  insurerCode: string | null
  insurerName: string
  counts: StateCounts
}

export interface FailureReasonStat {
  code: number | null
  label: string
  count: number
}

export interface WorkerStat {
  workerId: string | null
  workerName: string
  counts: StateCounts
}

export interface WorkerSummary {
  total: number
  ignored: number
  idle: number
  busy: number
  unhealthy: string[]
}

export interface CompanyLockedSummary {
  companyName: string
  insurers: { first: string; second: number }[]
}

export interface TrendPoint {
  workDate: string
  counts: StateCounts
}

export interface DashboardResponse {
  workDate: string
  generatedAt: number
  cached: boolean
  workers: WorkerSummary | null
  totals: StateCounts | null
  byCompany: CompanyStat[] | null
  byInsurer: InsurerStat[] | null
  failureReasons: FailureReasonStat[] | null
  byWorker: WorkerStat[] | null
  lockedAccounts: CompanyLockedSummary[] | null
  trend: (TrendPoint | null)[]
}
