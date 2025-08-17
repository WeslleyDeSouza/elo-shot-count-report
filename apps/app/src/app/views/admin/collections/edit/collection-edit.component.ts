import {Component, signal, inject, OnInit, OnDestroy, ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { CollectionFormComponent } from '../form/collection-form.component';
import { Collection } from '../collection.model';
import { CollectionFacade } from '../collection.facade';

@Component({
  selector: 'app-collection-edit',
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
              <h1 class="h3">{{ 'admin.collection.edit.title' | translate }}</h1>
              <p class="text-muted">{{ 'admin.collection.edit.subtitle' | translate }}</p>
            </div>
            <button type="button" class="btn btn-outline-secondary" (click)="goBack()">
              <i class="ri-arrow-left-line"></i> {{ 'admin.common.back' | translate }}
            </button>
          </div>
        </div>
      </div>

      @if(loading()) {
        <div class="text-center py-4">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      @if(error()) {
        <div class="alert alert-danger" role="alert">
          {{ error() }}
        </div>
      }

      @if(!loading() && collection()) {
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <app-collection-form 
                  [collection]="collection()"
                  (cancel)="goBack()"
                  (save)="onSave($event)">
                </app-collection-form>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CollectionEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private facade = inject(CollectionFacade);

  collection = signal<Collection | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.setupFacadeSubscriptions();
    this.loadCollection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFacadeSubscriptions(): void {
    this.facade.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading.set(loading));

    this.facade.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error.set(error));
  }

  private loadCollection(): void {
    this.route.params.pipe(
      switchMap(params => {
        const id = params['id'];
        return this.facade.getCollection(id);
      }),
      takeUntil(this.destroy$)
    ).subscribe(collection => {
      this.collection.set(collection);
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/collections']);
  }

  onSave(collection: Collection): void {
    this.router.navigate(['/admin/collections']);
  }
}