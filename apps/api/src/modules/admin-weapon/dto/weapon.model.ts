import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class WeaponModel {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  nameDe?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  nameFr?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  nameIt?: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  inWeight?: boolean;
}

export class WeaponCreateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  nameDe?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  nameFr?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  nameIt?: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  inWeight?: boolean;
}

export class WeaponUpdateDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  nameDe?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  nameFr?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  nameIt?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  inWeight?: boolean;
}

export class WeaponResultDto extends WeaponModel {}