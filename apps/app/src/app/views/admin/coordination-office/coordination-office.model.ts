// TODO: Update import once API client is generated
// import { CoordinationOfficeResultDto } from '@ui-elo/apiClient'

interface CoordinationOfficeModel {
  id: string;
  name: string;
  email: string;
  pin: string;
  allowedArealNames?: string;
  createdBy?: string;
  enabled: boolean;
}

export class CoordinationOffice implements CoordinationOfficeModel {
  id!: string;
  name!: string;
  email!: string;
  pin!: string;
  allowedArealNames?: string;
  createdBy?: string;
  enabled!: boolean;

  constructor(data?: Partial<CoordinationOfficeModel>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  get allowedArealList(): string[] {
    return this.allowedArealNames?.split(',').filter(name => name.trim()) || [];
  }

  get displayName(): string {
    return `${this.pin} - ${this.name}`;
  }
}