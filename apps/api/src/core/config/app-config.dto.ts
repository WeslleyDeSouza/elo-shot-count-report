import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsBoolean, IsIn, IsString, ValidateNested } from 'class-validator';

// Layout DTO
 class LayoutDto {
  @ApiPropertyOptional({
    description: 'Whether the sidebar is collapsed',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  sidebarCollapsed?: boolean;

  @ApiPropertyOptional({
    description: 'Position of the sidebar',
    enum: ['left', 'right'],
    example: 'left',
  })
  @IsOptional()
  @IsIn(['left', 'right'])
  sidebarPosition?: 'left' | 'right';

  @ApiPropertyOptional({
    description: 'Whether the header is fixed',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  headerFixed?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the footer is visible',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  footerVisible?: boolean;
}

// Theme DTO
 class ThemeDto {
  @ApiPropertyOptional({
    description: 'Color scheme preference',
    enum: ['light', 'dark'],
    example: 'light',
  })
  @IsOptional()
  @IsIn(['light', 'dark'])
  colorScheme?: 'light' | 'dark';

  @ApiPropertyOptional({
    description: 'Primary color in hex format',
    example: '#3b82f6',
    pattern: '^#[0-9a-fA-F]{6}$',
  })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({
    description: 'Font size preference',
    enum: ['small', 'medium', 'large'],
    example: 'medium',
  })
  @IsOptional()
  @IsIn(['small', 'medium', 'large'])
  fontSize?: 'small' | 'medium' | 'large';
}

// Main AppSettings DTO
export class AppSettingsDto {
  @ApiPropertyOptional({
    description: 'Layout configuration settings',
    type: LayoutDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LayoutDto)
  layout?: LayoutDto;

  @ApiPropertyOptional({
    description: 'Theme configuration settings',
    type: ThemeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeDto)
  theme?: ThemeDto;
}

// Create DTO (for POST requests)
export class CreateAppSettingsDto extends AppSettingsDto {
  @ApiProperty({
    description: 'Application settings configuration',
    example: {
      layout: {
        sidebarCollapsed: false,
        sidebarPosition: 'left',
        headerFixed: true,
        footerVisible: true,
      },
      theme: {
        colorScheme: 'light',
        primaryColor: '#3b82f6',
        fontSize: 'medium',
      },
    },
  })
  declare layout?: LayoutDto;

  @ApiProperty({
    description: 'Theme settings',
  })
  declare theme?: ThemeDto;
}

// Update DTO (for PATCH requests)
export class UpdateAppSettingsDto extends AppSettingsDto {
  // Inherits all optional properties from AppSettingsDto
}

// Response DTO (what the API returns)
export class AppSettingsResponseDto extends AppSettingsDto {
  @ApiProperty({
    description: 'Unique identifier for the settings',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'When the settings were created',
    example: '2023-12-01T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the settings were last updated',
    example: '2023-12-01T15:45:00Z',
  })
  updatedAt: Date;
}
