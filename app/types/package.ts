import { file, z } from 'zod'

const packageSchema = z.object({
    name: z.string().min(1, '패키지명을 입력해주세요'),
    version: z.string().min(1, '버전을 입력해주세요'),
    file: z.instanceof(File).refine(file => (file?.size ?? 0) > 0, '파일을 선택해주세요'),
    publishing: z.boolean().optional().default(false),
})

type Packages = z.infer<typeof packageSchema>

interface PackageListItem extends DefaultResponse {
    name: string;
    version: string;
    publishing: boolean;
    file: MinioFile;
}

export { packageSchema, type Packages, type PackageListItem }