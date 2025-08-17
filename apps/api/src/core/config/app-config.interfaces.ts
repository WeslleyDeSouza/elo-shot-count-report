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

// Shared utility functions
export class ConfigUtils {
  /**
   * Parse permissions from JSON string
   * @param value - JSON string value
   * @returns Parsed UserPermissions or empty object
   */
  static parsePermissions(value: string | undefined): UserPermissions {
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
  static parseSettings(value: string | undefined): AppSettings {
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
  static mergeSettings(tenantSettings: AppSettings, userSettings: AppSettings): AppSettings {
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