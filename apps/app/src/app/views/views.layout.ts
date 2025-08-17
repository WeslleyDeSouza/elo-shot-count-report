import { Component } from '@angular/core';
import { UpdateContainerComponent } from '@app-galaxy/sdk-ui';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-layout',
  template: `
    <router-outlet/>
    <app-galaxy-pwa-update-container/>
  `,
  imports: [
    RouterOutlet,
    UpdateContainerComponent
  ],
})
export class ViewsLayout {}
