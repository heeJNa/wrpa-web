export interface PackageListItem extends DefaultResponse {
    name: string;
    version: string;
    publishing: boolean;
    file: MinioFile;
}