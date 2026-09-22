export const useGlobalData = () => {
    const insuranceCompanyCodes = useState<InsuranceCompanyCode[]>('insuranceCompanyCodes', () => [])
    const teams = useState<{ id: string, code: string, name: string }[]>('teams', () => [])

    // 실패 시 기존 목록을 유지한다 (빈 배열로 덮어쓰지 않음)
    const refreshTeams = async () => {
        const { request } = useClientAPI()
        const { data } = await request<{ id: string, code: string, name: string }[]>('/api/auth/teams')
        if (data.value) teams.value = data.value
    }

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
    return { getInsuranceCompanyCodes, insuranceCompanyCodes, teams, refreshTeams }
}