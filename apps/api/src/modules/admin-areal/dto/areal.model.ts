import { ApiProperty } from '@nestjs/swagger';
import { ArealCategoryModel } from './areal-category.model';
import {IsBoolean, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import { BaseModel } from "@api-elo/models";
import { ArealWeaponLinkResultDto } from './areal-weapon.model';

export class ArealModel extends BaseModel<ArealCategoryModel> {
  @ApiProperty({ type: String, required: false })
  declare id: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  declare categoryId: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  declare name: string;

  @ApiProperty({ type: ArealCategoryModel })
  declare category: ArealCategoryModel;

  @IsNotEmpty()
  @ApiProperty({ type: Boolean })
  declare enabled: boolean;
}

export class ArealCreateDto {
  @IsNotEmpty()
  @ApiProperty({ type: String })
  categoryId: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  enabled: boolean;
}

export class ArealUpdateDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  arealId?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class ArealResultDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  categoryId: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: Boolean })
  enabled: boolean;

  @ApiProperty({ type: String })
  createdAt: string;

  @ApiProperty({ type: String })
  createdBy: string;

  @ApiProperty({ type: String })
  updatedAt: string;

  @ApiProperty({ type: String })
  tenantId: string;

  @ApiProperty({ type: String, required: false })
  deletedAt?: string;

  @ApiProperty({ type: String, required: false })
  deletedBy?: string;

  @ApiProperty({ type: ArealWeaponLinkResultDto, isArray: true, required: false })
  weaponLinks?: ArealWeaponLinkResultDto[];
}
