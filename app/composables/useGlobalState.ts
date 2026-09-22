export const useGlobalData = () => {
    const insuranceCompanyCodes = useState<InsuranceCompanyCode[]>('insuranceCompanyCodes', () => [])
    const teams = useState<{ id: string, code: string, name: string }[]>('teams', () => [])

    // useClientAPI(useToast→inject)는 setup 컨텍스트에서만 호출 가능 — await 이후나 콜백에서 부르면 안 되므로 여기서 받아둔다
    const { request } = useClientAPI()

    // 실패 시 기존 목록을 유지한다 (빈 배열로 덮어쓰지 않음)
    const refreshTeams = async () => {
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