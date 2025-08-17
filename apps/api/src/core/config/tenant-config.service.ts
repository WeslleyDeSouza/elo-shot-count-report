import { Injectable } from '@nestjs/common';
import { ConfigTenantDto, ConfigTenantFacade } from '@app-galaxy/core-api';
import {
  AppSettings,
  UserPermissions,
  AppConfigValue,
  APP_CONFIG_SECTIONS,
  APP_CONFIG_KEYS,
  ConfigUtils
} from './app-config.interfaces';

@Injectable()
export class TenantConfigService {
  constructor(
    private readonly tenantConfigFacade: ConfigTenantFacade
  ) {}

  /**
   * Get tenant configuration only (no user override)
   * @param tenantId - The tenant identifier
   * @returns Promise resolving to AppConfigValue
   */
  async getTenantConfig(tenantId: string | number): Promise<AppConfigValue | null> {
    const tenantConfig = await this.tenantConfigFacade.getConfigByKey(
      tenantId,
      APP_CONFIG_SECTIONS.APP_SETTINGS,
      APP_CONFIG_KEYS.SETTINGS
    );

    return tenantConfig ? {
      value: ConfigUtils.parseSettings(tenantConfig.metaValue),
      source: 'tenant',
      isOverridden: false
    } : null;
  }

  /**
   * Save tenant (global) application settings
   * @param tenantId - The tenant identifier
   * @param settings - The application settings
   * @returns Promise resolving to ConfigTenantDto
   */
  async saveTenantConfig(
    tenantId: string | number,
    settings: AppSettings
  ): Promise<ConfigTenantDto> {
    return this.tenantConfigFacade.saveOrUpdateConfigByKey(
      tenantId,
      APP_CONFIG_SECTIONS.APP_SETTINGS,
      APP_CONFIG_KEYS.SETTINGS,
      JSON.stringify(settings)
    ) as any as ConfigTenantDto;
  }

  /**
   * Save user permissions (what users can change)
   * @param tenantId - The tenant identifier
   * @param permissions - User permissions
   * @returns Promise resolving to ConfigTenantDto
   */
  async saveUserPermissions(
    tenantId: string | number,
    permissions: UserPermissions
  ): Promise<ConfigTenantDto> {
    return this.tenantConfigFacade.saveOrUpdateConfigByKey(
      tenantId,
      APP_CONFIG_SECTIONS.APP_SETTINGS,
      APP_CONFIG_KEYS.PERMISSIONS,
      JSON.stringify(permissions)
    ) as any as ConfigTenantDto;
  }

  /**
   * Get user permissions for a tenant
   * @param tenantId - The tenant identifier
   * @returns Promise resolving to UserPermissions
   */
  async getUserPermissions(tenantId: string | number): Promise<UserPermissions> {
    const permissionsConfig = await this.tenantConfigFacade.getConfigByKey(
      tenantId,
      APP_CONFIG_SECTIONS.APP_SETTINGS,
      APP_CONFIG_KEYS.PERMISSIONS
    );

    return permissionsConfig ?
      ConfigUtils.parsePermissions(permissionsConfig.metaValue) :
      {};
  }
}
