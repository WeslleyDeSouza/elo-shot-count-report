import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import {SchemaFromClassGenerator} from "../../../common";

export class BaseModel<Category> {
  @ApiProperty({ type: String, required: false })
  id!: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  categoryId!: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  name!: string;

  @IsNotEmpty()
  @ApiProperty({ type: Boolean })
  enabled!: boolean;

  category!: Category;
}

export const SCHEMA_BASE_MODEL = SchemaFromClassGenerator(BaseModel, {
  category: { type: 'object' },
});
