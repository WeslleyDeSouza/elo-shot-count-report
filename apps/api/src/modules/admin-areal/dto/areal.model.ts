import { ApiProperty } from '@nestjs/swagger';
import { ArealCategoryModel } from './areal-category.model';
import { IsNotEmpty } from 'class-validator';
import {BaseModel} from "@api-elo/models";

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
