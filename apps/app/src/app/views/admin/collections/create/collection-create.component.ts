import {Component, inject, OnDestroy, ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { CollectionFormComponent } from '../form/collection-form.component';
import { Collection } from '../collection.model';

@Component({
  selector: 'app-collection-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslatePipe,
    CollectionFormComponent
  ],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="h3">{{ 'admin.collection.create.title' | translate }}</h1>
              <p class="text-muted">{{ 'admin.collection.create.subtitle' | translate }}</p>
            </div>
            <button type="button" class="btn btn-outline-secondary" (click)="goBack()">
              <i class="ri-arrow-left-line"></i> {{ 'admin.common.back' | translate }}
            </button>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <app-collection-form 
                [collection]="null"
                (cancel)="goBack()"
                (save)="onSave($event)">
              </app-collection-form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CollectionCreateComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private router = inject(Router);

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/admin/collections']);
  }

  onSave(collection: Collection): void {
    this.router.navigate(['/admin/collections']);
  }
}