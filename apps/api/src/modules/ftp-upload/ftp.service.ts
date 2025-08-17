import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import Ftp from "ftp";
import {UploadFileResponseDto} from "./ftp.interface";

@Injectable()
export class FTPService  {
  constructor() {}

  async createClient(tenantId: string): Promise<Ftp> {
    let ftpConfig = {
      host: process.env["FTP_HOST"],
      port: Number(process.env["FTP_PORT"] || 21),
      user: process.env["FTP_USER"],
      password: process.env["FTP_PASSWORD"],
    }

    return new Promise((resolve, reject) => {
      const client = new Ftp();

      client.on("ready", () => resolve(client));

      client.on("error", err => {
        console.error("FTP client error:", err);
        reject(err);
      });

      client.connect({
        host: ftpConfig.host,
        port: ftpConfig.port,
        user: ftpConfig.user,
        password: ftpConfig.password,
      });
    });
  }

  async uploadFile(
    file: any,
    tenant: string | number,
    folderName: string,
    ftpClient: Ftp
  ): Promise<UploadFileResponseDto> {
    return new Promise((resolve, reject) => {
      const mimType = file.originalname.split('.').pop()
      const filePath = `${tenant}-app-${folderName}.`+mimType;
      ftpClient.put(file.buffer, filePath, err => {
        if (err) {
          Logger.error("FTP upload error:", err);
          Logger.error({
            host: process.env["FTP_HOST"],
            port: Number(process.env["FTP_PORT"] || 21),
            user: process.env["FTP_USER"]
          });
          reject(new InternalServerErrorException("Failed to upload file to FTP server"));
        }
        else {
          resolve({
            status: true,
            filePath,
          });
        }
      });
    });
  }

  async getFile(filePath: string, ftpClient: Ftp): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const TIMEOUT = 5000; // 10 seconds, adjust as needed

      const timeoutHandler = setTimeout(() => {
        reject(new InternalServerErrorException("Fetching file from FTP server timed out"));
      }, TIMEOUT);

      ftpClient.get(filePath, (err, stream) => {
        if (err) {
          clearTimeout(timeoutHandler);
          Logger.error("FTP get file error:", err);
          reject(new InternalServerErrorException("Failed to retrieve file from FTP server"));
          return;
        }

        const chunks = [];

        stream.on("data", chunk => chunks.push(chunk));

        stream.on("end", () => {
          clearTimeout(timeoutHandler);
          resolve(Buffer.concat(chunks));
        });

        stream.on("error", streamErr => {
          clearTimeout(timeoutHandler);
          Logger.error("FTP stream error:", streamErr);
          reject(new InternalServerErrorException("Failed to stream the file from FTP server"));
        });
      });
    });
  }

  async deleteFile(filePath: string, ftpClient: Ftp): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // First, try to delete as a file
      ftpClient.delete(filePath, (err, data) => {
        if (err) {
          // If main file deletion is successful, try to delete its associated .meta file
          const metaFilePath = filePath + ".meta";
          ftpClient.delete(metaFilePath, metaErr => {
            ftpClient.end();
            if (metaErr) {
              console.warn("Warning: Failed to delete associated .meta file:", metaErr);
            }
            resolve(true);
          });
        } else {
          ftpClient.end();
          resolve(true);
        }
      });
    });
  }
}
