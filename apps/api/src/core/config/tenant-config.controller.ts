import { Controller, Get, Post, Put, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReplayGuard } from '@movit/auth-api';
import { TenantConfigService } from './tenant-config.service';
import { AppSettings, UserPermissions, AppConfigValue } from './app-config.interfaces';
import { TenantGuard, GetTenantId } from '@app-galaxy/core-api';


@Controller('config/tenant')
@ApiTags('Tenant Config')
@UseGuards(... [
  AuthGuard('jwt'),
  TenantGuard,
  ReplayGuard,
].filter((_) => _))
@ApiBearerAuth()
export class TenantConfigController {

  constructor(private readonly tenantConfigService: TenantConfigService) {}

  @Get(':tenantId')
  @ApiOperation({ summary: 'Get tenant configuration' })
  @ApiResponse({ status: 200, description: 'Tenant configuration retrieved successfully' })
  @ApiParam({ name: 'tenantId', description: 'Tenant identifier' })
  async getTenantConfig(
    @GetTenantId() tenantId: string
  ): Promise<AppConfigValue | null> {
    return this.tenantConfigService.getTenantConfig(tenantId);
  }

  @Post(':tenantId')
  @ApiOperation({ summary: 'Save tenant configuration' })
  @ApiResponse({ status: 201, description: 'Tenant configuration saved successfully' })
  @ApiParam({ name: 'tenantId', description: 'Tenant identifier' })
  async saveTenantConfig(
    @GetTenantId() tenantId: string,
    @Body() settings: AppSettings
  ) {
    return this.tenantConfigService.saveTenantConfig(tenantId, settings);
  }

  @Put(':tenantId')
  @ApiOperation({ summary: 'Update tenant configuration' })
  @ApiResponse({ status: 200, description: 'Tenant configuration updated successfully' })
  @ApiParam({ name: 'tenantId', description: 'Tenant identifier' })
  async updateTenantConfig(
    @GetTenantId() tenantId: string,
    @Body() settings: AppSettings
  ) {
    return this.tenantConfigService.saveTenantConfig(tenantId, settings);
  }

  @Post(':tenantId/permissions')
  @ApiOperation({ summary: 'Save user permissions for tenant' })
  @ApiResponse({ status: 201, description: 'User permissions saved successfully' })
  @ApiParam({ name: 'tenantId', description: 'Tenant identifier' })
  async saveUserPermissions(
    @GetTenantId() tenantId: string,
    @Body() permissions: UserPermissions
  ) {
    return this.tenantConfigService.saveUserPermissions(tenantId, permissions);
  }

  @Put(':tenantId/permissions')
  @ApiOperation({ summary: 'Update user permissions for tenant' })
  @ApiResponse({ status: 200, description: 'User permissions updated successfully' })
  @ApiParam({ name: 'tenantId', description: 'Tenant identifier' })
  async updateUserPermissions(
    @GetTenantId() tenantId: string,
    @Body() permissions: UserPermissions
  ) {
    return this.tenantConfigService.saveUserPermissions(tenantId, permissions);
  }

  @Get(':tenantId/permissions')
  @ApiOperation({ summary: 'Get user permissions for tenant' })
  @ApiResponse({ status: 200, description: 'User permissions retrieved successfully' })
  @ApiParam({ name: 'tenantId', description: 'Tenant identifier' })
  async getUserPermissions(
    @GetTenantId() tenantId: string
  ): Promise<UserPermissions> {
    return this.tenantConfigService.getUserPermissions(tenantId);
  }
}
