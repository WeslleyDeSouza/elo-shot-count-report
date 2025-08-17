// ftp.module.ts
import { Module } from "@nestjs/common";

import { FTPService } from "./ftp.service";
import { ConfigModule } from "@nestjs/config";
import { UploadController } from "./ftp.controller";


@Module({
  controllers: [UploadController],
  providers: [FTPService],
  exports: [FTPService],
  imports: [ConfigModule],
})
export class UploadFTPModule {}
