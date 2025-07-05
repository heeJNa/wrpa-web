export const useGlobalData = () => {
    const insuranceCompanyCodes = useState<InsuranceCompanyCode[]>('insuranceCompanyCodes', () => [])

    return { insuranceCompanyCodes }
}