export interface Weapon {
  id: string;
  name: string;
  nameDe?: string;
  nameFr?: string;
  nameIt?: string;
  categoryId: string;
  enabled?: boolean;
  inWeight?: boolean;
}

export interface WeaponCategory {
  id: string;
  name: string;
  code: number;
  weapons: Weapon[];
}