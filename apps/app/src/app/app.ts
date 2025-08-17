import { Component, inject } from '@angular/core';
import { Router, RouterOutlet,ActivatedRoute } from '@angular/router';
import {loadRemoteModule, processRemoteInfo} from '@angular-architects/native-federation';
import { EffectsRunner } from '@ngrx/effects';
import {Store} from "@ngrx/store";
import {MenuUtils} from "./common";


@Component({
  selector: 'app-root',
  template: '<router-outlet/>',
  imports: [RouterOutlet],
})
export class App {
  constructor(
    protected route: ActivatedRoute, protected router:Router,protected store:Store) {

  }
}
