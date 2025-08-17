import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  HttpHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
  HealthCheckResult
} from '@nestjs/terminus';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomHealthIndicator } from './custom-health.indicator';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(
    //private dataSource: DataSource,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private customHealth: CustomHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Comprehensive health check' })
  @ApiResponse({ status: 200, description: 'Health check completed successfully' })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      //()    => this.db.pingCheck('database', { timeout: 5000 }),
      //()     => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),,
      ()  => this.memory.checkHeap('memory_heap', 1024 * 1024 * 1024),
    ]);
  }

  @Get('alive')
  @ApiOperation({ summary: 'Simple alive check' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  alive(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness check for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  ready(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 5000 }),
    ]);
  }

  @Get('db')
  @HealthCheck()
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Database health check completed' })
  checkDatabase(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 5000 }),
    ]);
  }

  @Get('external')
  @HealthCheck()
  @ApiOperation({ summary: 'External services health check' })
  @ApiResponse({ status: 200, description: 'External services health check completed' })
  checkExternalServices(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.http.pingCheck('google', 'https://google.com'),
      () => this.http.pingCheck('github', 'https://github.com'),
    ]);
  }

  @Get('custom')
  @HealthCheck()
  @ApiOperation({ summary: 'Custom services health check' })
  @ApiResponse({ status: 200, description: 'Custom services health check completed' })
  checkCustomServices(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.customHealth.isFileSystemHealthy('filesystem', process.platform === 'win32' ? 'C:\\temp' : '/tmp'),
    ]);
  }

  @Get('full')
  @HealthCheck()
  @ApiOperation({ summary: 'Full comprehensive health check' })
  @ApiResponse({ status: 200, description: 'Full health check completed' })
  checkAll(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 5000 }),
      //() => this.http.pingCheck('internal-api', 'http://localhost:3003/api/health/ping'),
      () => this.disk.checkStorage('disk', { path: process.platform === 'win32' ? 'C:\\' : '/', thresholdPercent: 0.9 }),
      () => this.memory.checkHeap('memory', 1024 * 1024 * 1024),
      () => this.customHealth.isFileSystemHealthy('filesystem', process.platform === 'win32' ? 'C:\\temp' : '/tmp'),
    ]);
  }
}
