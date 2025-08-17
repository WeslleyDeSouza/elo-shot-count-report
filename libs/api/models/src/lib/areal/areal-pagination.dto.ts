import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ArealResultDto } from './areal-result.dto';

export class ArealPaginationOptions {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'name',
    enum: ['name', 'categoryId', 'enabled', 'createdAt', 'updatedAt']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['name', 'categoryId', 'enabled', 'createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC']
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Filter by creator user ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsUUID()
  createdBy?: string;
}

export class ArealPaginationSearchOptions extends ArealPaginationOptions {
  @ApiPropertyOptional({
    description: 'Search term for areal name',
    example: 'training'
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ArealResultPaginationDto {
  @ApiProperty({
    description: 'Array of areals',
    type: [ArealResultDto]
  })
  data: ArealResultDto[];

  @ApiProperty({
    description: 'Total number of areals',
    example: 100
  })
  @IsNumber()
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10
  })
  @IsNumber()
  @Min(1)
  totalPages: number;
}