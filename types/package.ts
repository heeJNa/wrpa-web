export interface PackageListItem extends DefaultResponse {
    name: string;
    version: string;
    publishing: boolean;
    file: MinioFile;
}
export interface Packages {
    name: string;
    version: string;
    file: File;
    publishing: boolean;
}