import { Injectable, inject } from '@angular/core';
import {AdminArealCategoryService, AdminArealService, AdminWeaponService} from '@ui-elo/apiClient';

@Injectable()
export class CollectionArealService {

  protected api = inject(AdminArealService);
  protected apiCat = inject(AdminArealCategoryService);

  loadAreal(){
    return this.api.adminArealListAreal()
  }

  loadCategories(){
    return this.apiCat.adminArealCategoryList()
  }
}
