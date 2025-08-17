import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CoordinationOfficeModel {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ type: String })
  @IsString()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  pin: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  allowedArealNames?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class CoordinationOfficeCreateDto {
  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ type: String })
  @IsString()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  pin: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  allowedArealNames?: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class CoordinationOfficeUpdateDto {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  pin?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  allowedArealNames?: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class CoordinationOfficeResultDto extends CoordinationOfficeModel {}