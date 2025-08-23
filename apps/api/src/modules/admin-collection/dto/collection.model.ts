import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  IsBoolean,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CollectionPersonDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  pin: string;

  @ApiProperty({ type: String })
  @IsString()
  responsible: string;

  @ApiProperty({ type: String })
  @IsString()
  unit: string;
}

export class TimeRangeDto {
  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  from: string | null;

  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  till: string | null;
}

export class DateDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ type: TimeRangeDto })
  @IsObject()
  morning: TimeRangeDto;

  @ApiProperty({ type: TimeRangeDto })
  @IsObject()
  midday: TimeRangeDto;

  @ApiProperty({ type: TimeRangeDto })
  @IsObject()
  evening: TimeRangeDto;
}

export class CollectionCreateDto {
  @ApiProperty({ type: String, required: true, format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  arealCategoryId: string;

  @ApiProperty({ type: String, required: true, format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  arealId: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  userType: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  pin: string;

  @ApiProperty({ type: CollectionPersonDto, required: true })
  @IsObject()
  person: CollectionPersonDto;

  @ApiProperty({ type: DateDto, required: true })
  @IsObject()
  date: DateDto;

  @ApiProperty({
    type: Object,
    required: true,
    description: 'Weapons list with counts',
  })
  @IsObject()
  weapons: { [key: string]: number };

}

export class CollectionLocationDto {
  @ApiProperty({ type: String, required: true, format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  arealId: string;

  @ApiProperty({ type: String, required: true, format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  arealCategoryId: string;

  @ApiProperty({
    type: Object,
    required: true,
    description: 'Weapons list with counts',
  })
  @IsObject()
  weapons: Record<string, number>;
}

export class CollectionManyCreateDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  userType: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  pin: string;

  @ApiProperty({ type: CollectionPersonDto, required: true })
  @IsObject()
  person: CollectionPersonDto;

  @ApiProperty({ type: DateDto, required: true })
  @IsObject()
  date: DateDto;

  @ApiProperty({
    type: [CollectionLocationDto],
    required: true,
    description: 'Array of locations with their weapons data'
  })
  @IsArray()
  locations: CollectionLocationDto[];
}


export class CollectionUpdateDto {
  @ApiProperty({ type: String, required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  arealCategoryId?: string;

  @ApiProperty({ type: String, required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  arealId?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  userType?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  pin?: string;

  @ApiProperty({ type: CollectionPersonDto, required: false })
  @IsOptional()
  @IsObject()
  person?: CollectionPersonDto;

  @ApiProperty({ type: DateDto, required: false })
  @IsOptional()
  @IsObject()
  date?: DateDto;

  @ApiProperty({
    type: Object,
    required: false,
    description: 'Weapons list with counts',
  })
  @IsOptional()
  @IsObject()
  weapons?: { [key: string]: number };


}

export class CollectionFilterParamsDto {


  @ApiProperty({ type: String, required: false, description: 'Filter by year' })
  @IsOptional()
  @IsString()
  year?: string | number;

  @ApiProperty({ type: String, required: false, description: 'Filter by PIN' })
  @IsOptional()
  @IsString()
  pin?: string;

  @ApiProperty({ type: String, required: false, format: 'uuid', description: 'Filter by areal category ID' })
  @IsOptional()
  @IsUUID()
  arealCategoryId?: string;

  @ApiProperty({ type: String, required: false, format: 'uuid', description: 'Filter by areal ID' })
  @IsOptional()
  @IsUUID()
  arealId?: string;

  @ApiProperty({ type: String, required: false, description: 'Filter by specific date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ type: String, required: false, description: 'Filter by date from (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiProperty({ type: String, required: false, description: 'Filter by date until (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  dateTill?: string;

  @ApiProperty({ type: String, required: false, description: 'Filter by person name' })
  @IsOptional()
  @IsString()
  person?: string;

  @ApiProperty({ type: String, required: false, description: 'Filter by responsible person' })
  @IsOptional()
  @IsString()
  verantwortlicher?: string;

  @ApiProperty({ type: String, required: false, description: 'Filter by unit' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ type: [String], required: false, description: 'Filter by areal IDs' })
  @IsOptional()
  areal?: string[];

  @ApiProperty({ type: [String], required: false, description: 'Filter by areal category IDs' })
  @IsOptional()
  arealCategories?: string[];

  @ApiProperty({ type: String, required: false, description: 'Filter by user type' })
  @IsOptional()
  @IsString()
  userType?: string;
}

export class CollectionResultDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  arealCategoryId: string;

  @ApiProperty()
  arealId: string;

  @ApiProperty()
  userType: string;

  @ApiProperty()
  pin: string;

  @ApiProperty()
  weapons: string;

  @ApiProperty()
  person: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty({ required: false })
  deletedAt?: string;

  @ApiProperty({ required: false })
  deletedBy?: string;
}
