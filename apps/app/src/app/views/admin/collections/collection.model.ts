// Collection interfaces and models
import { CollectionCreateDto } from '@ui-elo/apiClient';
export interface CollectionPerson {
  name: string;
  pin: string;
  responsible: string;
  unit: string;
}

export interface TimeRange {
  from: string | null;
  till: string | null;
}

export interface CollectionDate {
  date: string;
  morning: TimeRange;
  midday: TimeRange;
  evening: TimeRange;
}

export class Collection {
  id: string = '';
  arealCategoryId: string = '';
  arealId: string = '';
  userType: string = '';
  pin: string = '';
  weapons: string = '';
  person: string = '';
  date: string = '';
  enabled: boolean = true;
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

  get personData(): CollectionPerson | null {
    try {
      return JSON.parse(this.person);
    } catch {
      return null;
    }
  }

  get dateData(): CollectionDate | null {
    try {
      return JSON.parse(this.date);
    } catch {
      return null;
    }
  }

  get weaponsData(): { [key: string]: number } | null {
    try {
      return JSON.parse(this.weapons);
    } catch {
      return null;
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
