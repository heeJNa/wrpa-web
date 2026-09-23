export interface WorkerDetail {
    id: string
    name: string
    state: string,
    type: string,
    shared: boolean,
    owners: LabelValue[],
    tags: LabelValue[],
    lastConnectedTime: number,
    version: string,
    launcherVersion: string,
    workerHealth: boolean,
    hidHealthCount?: number | null,
    hidTotalCount?: number | null,
    // 카운트가 hid /health 실측값인가(v3 워커만 true). 아니면 카운트를 믿지 않는다 —
    // v1 client는 DNS 해석만, wrpa-lite는 물리 장치 수라 뜻이 다르다.
    hidHealthProbed?: boolean | null,
    // 실측이 아니면 null(미확인)
    hidHealthy?: boolean | null,
    statePretty: string,
    typePretty: string,
    lastConnectedTimePretty: string,
    lastConnectedTimeRelative: string
}