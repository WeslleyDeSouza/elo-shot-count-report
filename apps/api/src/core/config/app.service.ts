import { Injectable } from '@nestjs/common';
import { ConfigTenantDto, ConfigTenantFacade, ConfigUserDto, ConfigUserFacade } from '@app-galaxy/core-api';

// Configuration sections
export const APP_CONFIG_SECTIONS = {
  APP_SETTINGS: 'app_settings'
} as const;

// Configuration keys
export const APP_CONFIG_KEYS = {
  SETTINGS: 'settings',
  PERMISSIONS: 'permissions'
} as const;

// Interface for application settings
export interface AppSettings {
  layout?: {
    sidebarCollapsed?: boolean;
    sidebarPosition?: 'left' | 'right';
    headerFixed?: boolean;
    footerVisible?: boolean;
  };
  theme?: {
    colorScheme?: 'light' | 'dark';
    primaryColor?: string;
    fontSize?: 'small' | 'medium' | 'large';
  };
}

// Interface for user permissions
export interface UserPermissions {
  canChangeLayout?: boolean;
  canChangeTheme?: boolean;
}

export interface AppConfigValue {
  value: AppSettings | undefined;
  source: 'tenant' | 'user';
  isOverridden: boolean;
}

@Injectable()
export class AppConfigService {
  constructor(
    protected tenantConfigFacade: ConfigTenantFacade,
    protected configUserFacade: ConfigUserFacade
  ) {}

  /**
   * Get application settings with user override support
   * @param tenantId - The tenant identifier
   * @param userId - The user identifier (optional)
   * @returns Promise resolving to AppConfigValue
   */
  async getConfig(
    tenantId: string | number,
    userId: string | undefined
  ): Promise<AppConfigValue | null> {
    // Get tenant (global) config
    const tenantConfig = await this.tenantConfigFacade.getConfigByKey(
      tenantId,
      APP_CONFIG_SECTIONS.APP_SETTINGS,
      APP_CONFIG_KEYS.SETTINGS
    );

    // If no user provided, return tenant config only
    if (!userId) {
      return tenantConfig ? {
        value: this.parseSettings(tenantConfig.metaValue),
        source: 'tenant',
        isOverridden: false
      } : null;
    }

    // Get user config
    const userConfig = await this.configUserFacade.getConfigByKey(
      userId,
      APP_CONFIG_SECTIONS.APP_SETTINGS,
      APP_CONFIG_KEYS.SETTINGS
    );

    // If user config exists, merge with tenant config
    if (userConfig) {
      const tenantSettings = this.parseSettings(tenantConfig?.metaValue);
      const userSettings = this.parseSettings(userConfig.metaValue);

      return {
        value: this.mergeSettings(tenantSettings, userSettings),
        source: 'user',
        isOverridden: !!tenantConfig
      };
    }

    // Return tenant config if user config doesn't exist
    return tenantConfig ? {
      value: this.parseSettings(tenantConfig.metaValue),
      source: 'tenant',
      isOverridden: false
    } : null;
  }

  /**
   * Save tenant (global) application settings
   * @param tenantId - The tenant identifier
   * @param settings - The application settings
   * @returns Promise resolving to ConfigTenantEntity
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
   * @returns Promise resolving to ConfigTenantEntity
   */
  async saveUserPermissions(
    tenantId: string | number,
    permissions: UserPermissions
  ): Promise<ConfigUserDto> {
    return this.tenantConfigFacade.saveOrUpdateConfigByKey(
      tenantId,
      APP_CONFIG_SECTIONS.APP_SETTINGS,
      APP_CONFIG_KEYS.PERMISSIONS,
      JSON.stringify(permissions)
    ) as any as ConfigUserDto;
  }

  /**
   * Save user application settings (overrides tenant defaults)
   * @param userId - The user identifier
   * @param settings - The application settings
   * @returns Promise resolving to ConfigUserEntity
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
   * Parse permissions from JSON string
   * @param value - JSON string value
   * @returns Parsed UserPermissions or empty object
   */
  private parsePermissions(value: string | undefined): UserPermissions {
    if (!value) return {};

    try {
      return JSON.parse(value) as UserPermissions;
    } catch {
      return {};
    }
  }

  /**
   * Parse settings from JSON string
   * @param value - JSON string value
   * @returns Parsed AppSettings or empty object
   */
  private parseSettings(value: string | undefined): AppSettings {
    if (!value) return {};

    try {
      return JSON.parse(value) as AppSettings;
    } catch {
      return {};
    }
  }

  /**
   * Merge user settings with tenant settings (user overrides tenant)
   * @param tenantSettings - Tenant settings
   * @param userSettings - User settings
   * @returns Merged settings
   */
  private mergeSettings(tenantSettings: AppSettings, userSettings: AppSettings): AppSettings {
    return {
      layout: {
        ...tenantSettings.layout,
        ...userSettings.layout
      },
      theme: {
        ...tenantSettings.theme,
        ...userSettings.theme
      }
    };
  }
}
