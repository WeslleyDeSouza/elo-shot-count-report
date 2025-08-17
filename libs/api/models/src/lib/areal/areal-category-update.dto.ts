import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength, IsOptional, IsUUID } from 'class-validator';
import { ArealCategoryCreateDto } from './areal-category-create.dto';

export class ArealCategoryUpdateDto {
  @ApiProperty({
    description: 'Areal category ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Areal category name',
    example: 'Updated Indoor Range',
    minLength: 1,
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Areal category code',
    example: 'INDOOR_002',
    minLength: 1,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code?: string;
}