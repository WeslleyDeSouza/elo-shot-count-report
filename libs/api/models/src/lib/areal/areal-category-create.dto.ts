import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ArealCategoryCreateDto {
  @ApiProperty({
    description: 'Areal category name',
    example: 'Indoor Range',
    minLength: 1,
    maxLength: 255
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Areal category code',
    example: 'INDOOR_001',
    minLength: 1,
    maxLength: 50
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;
}