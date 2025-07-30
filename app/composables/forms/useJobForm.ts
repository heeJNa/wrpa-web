import { jobSchema, type Job, type JobForm } from "~/types/job"
import { v4 as uuidv4 } from 'uuid'

export const useJobForm = () => {
  const jobForm = ref<JobForm>({
    id: uuidv4(),
    botId: '',
    jobType: "",
    cronSchedule: '',
    lifetime: 1200000,
    closingMonth: undefined,
    locked: false,
    callbackId: undefined,
    workerId: undefined,
    contractCrawlDataModelId: '',
    startDate: '1',
    endDate: '31',
    workTime: '00:30',
    priority: 100,
    closingMonthNum: 0,
    note: undefined,
  })
  const { errors, validate } = useFormValidator(jobSchema, () => ({
    id: jobForm.value.id,
    botId: jobForm.value.botId,
    jobType: jobForm.value.jobType,
    cronSchedule: jobForm.value.cronSchedule,
    lifetime: jobForm.value.lifetime,
    closingMonth: jobForm.value.closingMonth,
    locked: jobForm.value.locked,
    callbackId: jobForm.value.callbackId,
    workerId: jobForm.value.workerId,
    contractCrawlDataModelId: jobForm.value.contractCrawlDataModelId,
    startDate: jobForm.value.startDate,
    endDate: jobForm.value.endDate,
    workTime: jobForm.value.workTime,
    priority: jobForm.value.priority,
    closingMonthNum: jobForm.value.closingMonthNum,
    note: jobForm.value.note,
  }))

  return {
    jobForm,
    errors,
    validate,
  }
}
