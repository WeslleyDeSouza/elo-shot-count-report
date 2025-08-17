
export interface IFTPConfig {
  host: string;
  port: string | number;
  user: string;
  password: string;
}

export class UploadFileResponseDto {
  status: boolean
  filePath:string
}
