import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ArealWeaponLinkCreateDto {
  @ApiProperty({ type: String })
  @IsUUID()
  arealId: string;

  @ApiProperty({ type: String })
  @IsUUID()
  weaponId: string;
}

export class ArealWeaponLinkResultDto {
  @ApiProperty({ type: String })
  arealId: string;

  @ApiProperty({ type: String })
  weaponId: string;
}