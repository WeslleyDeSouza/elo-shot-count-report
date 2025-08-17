import { ApiProperty } from '@nestjs/swagger';
import { ArealModel, ArealResultDto } from './areal.model';
import { IsNotEmpty } from 'class-validator';
import { BaseCategoryModel } from "@api-elo/models";

export class ArealCategoryModel extends BaseCategoryModel {
  @ApiProperty({ type: String, required: false })
  declare id: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  declare name: string;

  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  declare code: string;

  @ApiProperty({ type: ArealModel, isArray: true })
  declare areas: ArealModel[];
}

export class ArealCategoryCreateDto {
  @IsNotEmpty()
  @ApiProperty({ type: String })
  name: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  code: string;
}

export class ArealCategoryUpdateDto {
  @ApiProperty({ type: String, required: false })
  id?: string;

  @ApiProperty({ type: String, required: false })
  name?: string;

  @ApiProperty({ type: String, required: false })
  code?: string;
}

export class ArealCategoryResultDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  code: string;

  @ApiProperty({ type: ArealResultDto, isArray: true })
  areas: ArealResultDto[];

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
}
