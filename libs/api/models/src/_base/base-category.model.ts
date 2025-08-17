import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import {SchemaFromClassGenerator} from "../../../common";

export class BaseCategoryModel {
  @ApiProperty({ type: String, required: false })
  id!: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty()
  @ApiProperty({ type: String, required: false })
  code!: string;
}

export const SCHEMA_BASE_CATEGORY_MODEL = SchemaFromClassGenerator(BaseCategoryModel);
