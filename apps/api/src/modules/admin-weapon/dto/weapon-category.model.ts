import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID, IsNumber } from 'class-validator';
import { WeaponModel } from './weapon.model';

export class WeaponCategoryModel {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  code: number;

  @ApiProperty({ type: WeaponModel, isArray: true })
  weapons?: WeaponModel[];
}

export class WeaponCategoryCreateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  code: number;
}

export class WeaponCategoryUpdateDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  code?: number;
}

export class WeaponCategoryResultDto extends WeaponCategoryModel {}