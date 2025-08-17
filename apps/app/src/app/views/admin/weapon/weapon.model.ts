import {WeaponCategoryResultDto, WeaponResultDto} from '@ui-elo/apiClient'
export class Weapon implements WeaponResultDto {
  id: string = '';
  name: string = '';
  nameDe: string = '';
  nameFr: string = '';
  nameIt: string = '';
  categoryId: string = '';
  enabled: boolean = true;
  inWeight: boolean = false;
  createdAt: string = '';
  createdBy: string = '';
  updatedAt: string = '';
  tenantId: string = '';
  deletedAt?: string;
  deletedBy?: string;

  constructor(data?: any) {
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

export class WeaponCategory implements WeaponCategoryResultDto{
  id: string = '';
  name: string = '';
  code: number = 0;
  weapons: Weapon[] = [];
  createdAt: string = '';
  createdBy: string = '';
  updatedAt: string = '';
  tenantId: string = '';
  deletedAt?: string;
  deletedBy?: string;

  constructor(data?: any) {
    if (data) {
      Object.assign(this, data);
      this.weapons = (data.weapons || []).map((w: any) => new Weapon(w));
    }
  }

  get weaponsCount(): number {
    return this.weapons?.length || 0;
  }

  get enabledWeaponsCount(): number {
    return this.weapons?.filter(weapon => weapon.enabled).length || 0;
  }

  get createdAtDate(): Date {
    return new Date(this.createdAt);
  }

  get updatedAtDate(): Date {
    return new Date(this.updatedAt);
  }
}
