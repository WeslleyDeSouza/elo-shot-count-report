import { Injectable } from '@nestjs/common';
import { ConfigUserDto, ConfigUserFacade } from '@app-galaxy/core-api';
import {
  AppSettings,
  AppConfigValue,
  APP_CONFIG_SECTIONS,
  APP_CONFIG_KEYS,
  ConfigUtils
} from './app-config.interfaces';
import { TenantConfigService } from './tenant-config.service';

@Injectable()
export class UserConfigService {
  constructor(
    private readonly configUserFacade: ConfigUserFacade,
    private readonly tenantConfigService: TenantConfigService
  ) {}

  /**
   * Get user configuration with tenant fallback
   * @param userId - The user identifier
   * @param tenantId - The tenant identifier for fallback
   * @returns Promise resolving to AppConfigValue
   */
  async getUserConfig(
    userId: string,
    tenantId: string | number
  ): Promise<AppConfigValue | null> {
    // Get tenant config first
    const tenantConfig = await this.tenantConfigService.getTenantConfig(tenantId);

    // Get user config
    const userConfig = await this.configUserFacade.getConfigByKey(
      userId,
      APP_CONFIG_SECTIONS.APP_SETTINGS,
      APP_CONFIG_KEYS.SETTINGS
    );

    // If user config exists, merge with tenant config
    if (userConfig) {
      const tenantSettings = tenantConfig?.value || {};
      const userSettings = ConfigUtils.parseSettings(userConfig.metaValue);

      return {
        value: ConfigUtils.mergeSettings(tenantSettings, userSettings),
        source: 'user',
        isOverridden: !!tenantConfig
      };
    }

    // Return tenant config if user config doesn't exist
    return tenantConfig;
  }

  /**
   * Get user-only configuration (no tenant fallback)
   * @param userId - The user identifier
   * @returns Promise resolving to AppConfigValue
   */
  async getUserOnlyConfig(userId: string): Promise<AppConfigValue | null> {
    const userConfig = await this.configUserFacade.getConfigByKey(
      userId,
      APP_CONFIG_SECTIONS.APP_SETTINGS,
      APP_CONFIG_KEYS.SETTINGS
    );

    return userConfig ? {
      value: ConfigUtils.parseSettings(userConfig.metaValue),
      source: 'user',
      isOverridden: false
    } : null;
  }

  /**
   * Save user application settings (overrides tenant defaults)
   * @param userId - The user identifier
   * @param settings - The application settings
   * @returns Promise resolving to ConfigUserDto
   */
  async saveUserConfig(
    userId: string,
    settings: AppSettings
  ): Promise<ConfigUserDto> {
    return this.configUserFacade.saveOrUpdateConfigByKey(
      userId,
      APP_CONFIG_SECTIONS.APP_SETTINGS,
      APP_CONFIG_KEYS.SETTINGS,
      JSON.stringify(settings)
    ) as any as ConfigUserDto;
  }

  /**
   * Delete user configuration (fallback to tenant config)
   * @param userId - The user identifier
   * @returns Promise resolving to boolean
   */
  async deleteUserConfig(userId: string): Promise<boolean> {
    try {
      // Note: This assumes the facade has a delete method
      // You may need to implement this in the facade if it doesn't exist
      // await this.configUserFacade.deleteConfigByKey(userId, APP_CONFIG_SECTIONS.APP_SETTINGS, APP_CONFIG_KEYS.SETTINGS);

      // For now, we'll save an empty config as a workaround
      await this.saveUserConfig(userId, {});
      return true;
    } catch (error) {
      return false;
    }
  }
}
