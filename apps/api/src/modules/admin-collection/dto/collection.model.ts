import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  IsBoolean,
  IsUUID,
} from 'class-validator';

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

  @ApiProperty({ type: Boolean, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
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

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
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
  enabled: boolean;

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