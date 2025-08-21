import { Routes } from '@angular/router';
import { ArealWeaponRelationOverviewComponent } from './overview/areal-weapon-relation-overview.component';
import { ArealWeaponRelationFacade } from './areal-weapon-relation.facade';

export const AREAL_WEAPON_RELATION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },
  {
    path: 'overview',
    component: ArealWeaponRelationOverviewComponent,
    providers: [ArealWeaponRelationFacade],
    title: 'Areal Weapon Relations'
  }
];