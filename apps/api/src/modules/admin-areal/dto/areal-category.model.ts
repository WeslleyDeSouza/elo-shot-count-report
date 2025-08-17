import { ApiProperty } from '@nestjs/swagger';
import { ArealModel } from './areal.model';
import { IsNotEmpty } from 'class-validator';
import {BaseCategoryModel} from "@api-elo/models";

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
