export enum JobTypesEnum {
    "NEW" = "신계약",
    "CONTRACT" = "수금",
    "COMMISSION" = "수수료",
    "MONITORING" = "모니터링",
    "CONTRACT_DETAIL" = "계약상세",
    "UNKNOWN" = "알수없음"
}

export enum JobTypesStateEnum {
    AVAILABLE = "사용가능",
    UNAVAILABLE = "사용불가",
    WORKING = "작업중",
}