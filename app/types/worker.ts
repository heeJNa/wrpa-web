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
    statePretty: string,
    typePretty: string,
    lastConnectedTimePretty: string,
    lastConnectedTimeRelative: string
}