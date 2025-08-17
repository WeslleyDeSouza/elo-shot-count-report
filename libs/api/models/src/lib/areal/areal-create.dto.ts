import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, MaxLength, MinLength } from 'class-validator';

export class ArealCreateDto {
  @ApiProperty({
    description: 'Areal category ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({
    description: 'Areal name',
    example: 'Training Area 1',
    minLength: 1,
    maxLength: 255
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Whether the areal is enabled',
    example: true
  })
  @IsNotEmpty()
  @IsBoolean()
  enabled: boolean;
}