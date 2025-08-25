import {Component, ChangeDetectionStrategy, OnInit, inject, computed, signal} from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet
  ],
  template: ` <router-outlet (activate)="onActivatedComponent($event)"/>`,
  standalone:true
})
export class AdminLayoutComponent {
  private router = inject(Router);

  title:string = "";
  subTitle:string = "";

  onActivatedComponent($event:any){
    this.title = $event.title;
    this.subTitle = $event.subTitle;
    this.onUpdateParent(this)
  }

  onUpdateParent(params?:any){

  }
}
