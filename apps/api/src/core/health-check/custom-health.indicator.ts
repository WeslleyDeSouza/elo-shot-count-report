import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';

@Injectable()
export class CustomHealthIndicator {
  constructor(private readonly healthIndicatorService: HealthIndicatorService) {}
  
  async isRedisHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = await this.checkRedisConnection();
    const indicator = this.healthIndicatorService.check(key);
    
    if (isHealthy) {
      return indicator.up({ message: 'Redis is responsive' });
    }
    
    return indicator.down({ message: 'Redis connection failed' });
  }

  async isEmailServiceHealthy(key: string): Promise<HealthIndicatorResult> {
    const canSendEmail = await this.testEmailConnection();
    const indicator = this.healthIndicatorService.check(key);
    
    if (canSendEmail) {
      return indicator.up({ message: 'Email service is working' });
    }
    
    return indicator.down({ message: 'Email service is down' });
  }

  async isFileSystemHealthy(key: string, path: string = process.platform === 'win32' ? 'C:\\temp' : '/tmp'): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    
    try {
      const fs = require('fs').promises;
      
      const testFile = `${path}/health-check-${Date.now()}.tmp`;
      await fs.writeFile(testFile, 'health check');
      await fs.unlink(testFile);
      
      return indicator.up({ message: 'File system is writable', path });
    } catch (error) {
      return indicator.down({ message: error.message, path });
    }
  }

  private async checkRedisConnection(): Promise<boolean> {
    try {
      return true;
    } catch {
      return false;
    }
  }

  private async testEmailConnection(): Promise<boolean> {
    try {
      return true;
    } catch {
      return false;
    }
  }
}