import { ApiProperty } from '@nestjs/swagger';
import { ArealCategoryModel } from './areal-category.model';
import { IsNotEmpty } from 'class-validator';
import { BaseModel } from "@api-elo/models";

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
  @ApiProperty({ type: Boolean })
  enabled: boolean;
}

export class ArealUpdateDto {
  @ApiProperty({ type: String, required: false })
  arealId?: string;

  @ApiProperty({ type: String, required: false })
  categoryId?: string;

  @ApiProperty({ type: String, required: false })
  name?: string;

  @ApiProperty({ type: Boolean, required: false })
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
}
