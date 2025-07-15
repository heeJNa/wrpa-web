export const fetchResponseHandler = async <T>(
    response: Response,
    dialogRef: any,
    toast: any,
    successMessage: string = '작업이 성공적으로 완료되었습니다.',
    errorMessage: string = '작업 중 오류가 발생했습니다.'
) => {
    if (response.ok) {
        toast.add({
            severity: 'success',
            summary: '성공',
            detail: successMessage,
            life: 3000,
        })
        const responseData = await response.json()
        dialogRef.value?.close(responseData) // Close the dialog after restart
    } else {
        toast.add({
            severity: 'error',
            summary: '오류',
            detail: errorMessage,
        })
    }
}