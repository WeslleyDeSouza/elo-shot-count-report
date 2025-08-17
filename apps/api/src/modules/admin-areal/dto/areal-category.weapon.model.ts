import { BaseEntity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export class AreaCategoryWeaponLinkModel extends BaseEntity {
  @ApiProperty({ type: String })
  private id: number;

  @ApiProperty({ type: String })
  categoryId: string;

  @ApiProperty({ type: String })
  weaponId: string;
}
