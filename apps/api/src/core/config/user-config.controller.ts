import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetTenantId, } from '@app-galaxy/core-api';
import { ReplayGuard , GetUserId, } from '@movit/auth-api';
import { UserConfigService } from './user-config.service';
import { AppSettings, AppConfigValue } from './app-config.interfaces';
import { AppSettingsDto } from './app-config.dto';

@Controller('config/user')
@ApiTags('User Config')
@UseGuards(... [
  AuthGuard('jwt'),
  ReplayGuard,
].filter((_) => _))
@ApiBearerAuth()
export class UserConfigController {

  constructor(private readonly userConfigService: UserConfigService) {}

  @Get('')
  @ApiOperation({ summary: 'Get user configuration with tenant fallback' })
  @ApiResponse({ status: 200, description: 'User configuration retrieved successfully' })
  @ApiParam({ name: 'userId', description: 'User identifier' })
  @ApiQuery({ name: 'tenantId', description: 'Tenant identifier for fallback', required: true })
  async getUserConfig(
    @GetUserId() userId: string,
    @GetTenantId() tenantId: string
  ): Promise<AppConfigValue | null> {
    return this.userConfigService.getUserConfig(userId, tenantId);
  }

  @Get('only')
  @ApiOperation({ summary: 'Get user-only configuration (no tenant fallback)' })
  @ApiResponse({ status: 200, description: 'User-only configuration retrieved successfully' })
  @ApiParam({ name: 'userId', description: 'User identifier' })
  async getUserOnlyConfig(
    @Param('userId') userId: string
  ): Promise<AppConfigValue | null> {
    return this.userConfigService.getUserOnlyConfig(userId);
  }

  @Post('')
  @ApiOperation({ summary: 'Save user configuration' })
  @ApiResponse({ status: 201, description: 'User configuration saved successfully' })
  @ApiParam({ name: 'userId', description: 'User identifier' })
  async saveUserConfig(
    @GetUserId() userId: string,
    @Body() settings: AppSettingsDto
  ) {
    return this.userConfigService.saveUserConfig(userId, settings);
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Update user configuration' })
  @ApiResponse({ status: 200, description: 'User configuration updated successfully' })
  @ApiParam({ name: 'userId', description: 'User identifier' })
  async updateUserConfig(
    @GetUserId() userId: string,
    @Body() settings: AppSettingsDto
  ) {
    return this.userConfigService.saveUserConfig(userId, settings);
  }

  @Delete('')
  @ApiOperation({ summary: 'Delete user configuration (fallback to tenant)' })
  @ApiResponse({ status: 200, description: 'User configuration deleted successfully' })
  @ApiParam({ name: 'userId', description: 'User identifier' })
  async deleteUserConfig(
   @GetUserId() userId: string,
  ): Promise<{ success: boolean }> {
    const success = await this.userConfigService.deleteUserConfig(userId);
    return { success };
  }

  @Get('merged')
  @ApiOperation({ summary: 'Get merged user configuration (user + tenant)' })
  @ApiResponse({ status: 200, description: 'Merged user configuration retrieved successfully' })
  @ApiParam({ name: 'userId', description: 'User identifier' })
  @ApiQuery({ name: 'tenantId', description: 'Tenant identifier for merging', required: true })
  async getMergedUserConfig(
    @GetUserId() userId: string,
    @GetTenantId() tenantId: string
  ): Promise<AppConfigValue | null> {
    return this.userConfigService.getUserConfig(userId, tenantId);
  }
}
