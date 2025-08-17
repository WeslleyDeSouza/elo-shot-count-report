import {Injectable, MiddlewareConsumer, NestMiddleware} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import {fileStaticPath} from "./core-static-file.module";
import {TENANT_ENTITY} from "@app-galaxy/core-api";

@Injectable()
export class StaticFileMiddleware implements NestMiddleware {
  // todo implement simple cache
  constructor(private dataSource: DataSource) {}

  get tableName(){
    return TENANT_ENTITY.entityNameResolver('tenant')+'_app_config'
  }

  async use(req: Request, res: Response, next: NextFunction) {
    if (
      !req.url?.includes('.') && // if path will ever have a dot, this needs to be addapted
      !req.url?.startsWith('/api') &&
      !req.url?.startsWith('/assets')
    ) {
      const domain = this.extractRootDomain(req.get('host'));
      const filePath = path.join(fileStaticPath, 'index.html');

      try {
        const domainConfig = await this.getDomainConfig(domain);

        const html = fs.readFileSync(filePath, 'utf8');
        const modifiedHtml = this.injectDomainInfo(html, domain, domainConfig);

        res.setHeader('Content-Type', 'text/html');
        res.send(modifiedHtml);
      } catch (error) {
        console.warn(error);
        next();
      }
    } else {
      next();
    }
  }

  private async getDomainConfig(domain: string) {
    // Use DataSource to query database
    const queryRunner = this.dataSource.createQueryRunner();
    const table =  this.tableName
    const tableKey = `tenantDomain`;
    try {
      const result = await queryRunner.query(
        'SELECT * FROM '+table+' WHERE ' +tableKey+' = ?',
        [domain]
      );
      return result[0] || {};
    } finally {
      await queryRunner.release();
    }
  }

  private injectDomainInfo(html: string, domain: string, config: any): string {
    const script = `<script>window.__APP_CONFIG = ${JSON.stringify({ domain, ...config })};</script>`;
    return html.replace('[INCUBATOR]', script)
  }

  private extractRootDomain(fullDomain) {
    if (!fullDomain) return '';

    // Entfernt Port falls vorhanden (z.B. test.com:3000 -> test.com)
    const domainWithoutPort = fullDomain.split(':')[0];

    // Extrahiert die letzten zwei Teile (domain.tld)
    const parts = domainWithoutPort.split('.');
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }

    return domainWithoutPort;
  }

  static configure(consumer: MiddlewareConsumer){
     return consumer.apply(StaticFileMiddleware).forRoutes(
       '*'
     );
  }
}
