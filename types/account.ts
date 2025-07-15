export interface AccountListItem {
    "id": string,
    "name": string,
    "userId": string,
    "userPhoneNumber"?: string,
    "telecomAgency"?: string,
    "note"?: string,
    "companyId": string,
    "companyName": string,
    "lock": boolean,
    "value": string,
    "insuranceCompanyCode": string,
    "insuranceCompanyName": string
}

export interface Account extends Omit<AccountListItem, 'companyName' | 'insuranceCompanyName' | 'value'> {
    feePassword?: string,
    groupId?: string,
    paymentDayOfMonth?: number,
    userCode?: string,
    userPw: string,
}