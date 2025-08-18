import { Injectable, inject } from '@angular/core';
import {AdminWeaponService} from '@ui-elo/apiClient';

@Injectable()
export class CollectionWeaponService {

  protected api = inject(AdminWeaponService);

  loadWeapons(){
    return this.api.adminWeaponListWeapon()
  }
}
