export interface Account {
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