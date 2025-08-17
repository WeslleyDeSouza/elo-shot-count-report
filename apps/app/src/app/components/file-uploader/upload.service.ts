import {inject, Injectable} from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";
import { UploadService } from "@ui-lib/apiClient";

interface UploadFileResponseDto {
  status: boolean;
  filePath: string;
}

@Injectable()
export class FileUploadService  {
  protected uploadService: UploadService = inject(UploadService)

  uploadFile(file: Blob, appName: string): Observable<UploadFileResponseDto> {
    return this.uploadService.uploadUploadFile({ appName, body:{file} }).pipe(
      map((response: any) => ({
        status: true,
        filePath: response?.filePath || '',
        ... response
      } as UploadFileResponseDto)),
      catchError(error => {
        console.error('Upload failed:', error);
        return throwError(() => error);
      })
    );
  }

  async deleteFile(key: string): Promise<any> {
    return this.uploadService.uploadDeleteFile({ key }).pipe(
      map(() => ({ status: true })),
      catchError(error => {
        console.error('Delete failed:', error);
        return throwError(() => error);
      })
    ).toPromise();
  }

}
