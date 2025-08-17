import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsDate } from 'class-validator';
import { ArealResultDto } from './areal-result.dto';

export class ArealCategoryResultDto {
  @ApiProperty({
    description: 'Areal category ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Areal category name',
    example: 'Indoor Range'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Areal category code',
    example: 'INDOOR_001'
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Areas in this category',
    type: [ArealResultDto]
  })
  areas: ArealResultDto[];

  @ApiProperty({
    description: 'Tenant ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  tenantId: string;

  @ApiProperty({
    description: 'Created by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  createdBy: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00.000Z'
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-01-01T00:00:00.000Z'
  })
  @IsDate()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Deleted by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  deletedBy?: string;

  @ApiPropertyOptional({
    description: 'Deletion date',
    example: '2023-01-01T00:00:00.000Z'
  })
  @IsDate()
  deletedAt?: Date;
}