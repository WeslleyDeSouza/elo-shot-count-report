export interface ArealWeaponRelation {
  id: string;
  arealId: string;
  weaponId: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface WeaponWithRelation {
  id: string;
  name: string;
  categoryId: string;
  enabled: boolean;
  hasRelation: boolean;
  relationId?: string;
}

export interface ArealWithWeapons {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  enabled: boolean;
  weapons: WeaponWithRelation[];
  weaponLinks?: WeaponWithRelation[];
}