export const useGlobalData = () => {
    const insuranceCompanyCodes = useState<InsuranceCompanyCode[]>('insuranceCompanyCodes', () => [])
    const teams = useState<{ id: string, code: string, name: string }[]>('teams', () => [])

    const getInsuranceCompanyCodes = (all: boolean) => {
        if (all) {
            return ([{
                code: '',
                name: '전체',
                sortName: '전체',
                type: 'ALL',
                typePretty: '전체',
                value: ''
            }] as InsuranceCompanyCode[]).concat(insuranceCompanyCodes.value)
        } else {
            return insuranceCompanyCodes.value
        }
    }
    return { getInsuranceCompanyCodes, insuranceCompanyCodes, teams }
}