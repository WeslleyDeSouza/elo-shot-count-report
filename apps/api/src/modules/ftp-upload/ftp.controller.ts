import {
  Body,
  Controller,
  Delete,
  Get, HttpException,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FTPService } from "./ftp.service";

import { TenantGuard, GetTenantId } from "@app-galaxy/core-api";
import { AuthGuard } from "@nestjs/passport";
import {ReplayGuard} from "@movit/auth-api";
import {ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse, ApiTags} from "@nestjs/swagger";
import {UploadFileResponseDto} from "./ftp.interface";


@ApiTags('Upload')
@Controller("upload")
@UseGuards(AuthGuard('jwt'), TenantGuard, ReplayGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly ftpService: FTPService) {}

  @Post("public-config")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFilePublicConfig(
    @UploadedFile() file: any,
    @GetTenantId() companyId: string ,
    @Query("appName") appName: string
  ) {
    if(!appName){
      throw new HttpException(
        'AppName required',500
      );
    }
    const client = await this.ftpService.createClient(companyId);
    return this.ftpService.uploadFile(file, companyId, 'config-'+appName, client);
  }


  @Post("")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        appName: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    type: UploadFileResponseDto
  })
  async uploadFile(
    @UploadedFile() file: any,
    @GetTenantId() companyId: string ,
    @Query("appName") appName: string
  ) {

    if(!appName){
     throw new HttpException(
       'AppName required',500
     );
    }

    const client = await this.ftpService.createClient(companyId);
    return this.ftpService.uploadFile(file, companyId, appName, client);
  }

  @Delete()
  @ApiResponse({ status: 201, description: 'File deleted successfully', type: Boolean })
  async deleteFile(@GetTenantId() companyId: string, @Query("key") key: string) {
    const client = await this.ftpService.createClient(companyId);
    return this.ftpService.deleteFile(key, client);
  }

}
