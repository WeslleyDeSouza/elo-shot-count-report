import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, MaxLength, MinLength, IsOptional, IsUUID } from 'class-validator';

export class ArealUpdateDto {
  @ApiProperty({
    description: 'Areal ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  arealId: string;

  @ApiPropertyOptional({
    description: 'Areal category ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Areal name',
    example: 'Updated Training Area',
    minLength: 1,
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Whether the areal is enabled',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}