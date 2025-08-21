import {ArealResultDto, ArealCategoryResultDto, ArealWeaponLinkResultDto} from '@ui-elo/apiClient'

 type ArealModel = ArealResultDto;
 type ArealCategoryModel = ArealCategoryResultDto;

export class Areal implements ArealModel {
  id!: string;
  arealId?: string;
  name!: string;
  enabled!: boolean;
  categoryId!: string;
  createdAt!: string;
  createdBy!: string;
  updatedAt!: string;
  tenantId!: string;
  deletedAt?: string;
  deletedBy?: string;
  weaponLinks?: Array<ArealWeaponLinkResultDto>;
  constructor(data?: Partial<ArealModel>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  get createdAtDate(): Date {
    return new Date(this.createdAt);
  }

  get updatedAtDate(): Date {
    return new Date(this.updatedAt);
  }
}

export class ArealCategory implements ArealCategoryModel {
  id!: string;
  name!: string;
  code!: string;
  areas!: ArealResultDto[];
  createdAt!: string;
  createdBy!: string;
  updatedAt!: string;
  tenantId!: string;
  deletedAt?: string;
  deletedBy?: string;

  constructor(data?: Partial<ArealCategoryModel>) {
    if (data) {
      Object.assign(this, data);
      this.areas = data.areas || [];
    }
  }


  get areasCount(): number {
    return this.areas?.length || 0;
  }

  get enabledAreasCount(): number {
    return this.areas?.filter(area => area.enabled).length || 0;
  }

  get createdAtDate(): Date {
    return new Date(this.createdAt);
  }

  get updatedAtDate(): Date {
    return new Date(this.updatedAt);
  }
}
