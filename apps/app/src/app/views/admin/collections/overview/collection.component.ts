import {Component, signal, computed, OnInit, OnDestroy, inject, Signal, ChangeDetectionStrategy} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionFacade } from '../collection.facade';
import { Collection } from '../collection.model';
import {firstValueFrom, Subject, takeUntil} from 'rxjs';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { Router } from '@angular/router';
import { EmptyStateComponent } from "../../../../components";
import {ComponentBase} from "@app-galaxy/sdk-ui";
import {EnrichedCollection, TableResult} from "@ui-elo/apiClient";

const PATHS = {
  COLLECTION_CREATE: '/admin/collections/create',
  COLLECTION_EDIT: '/admin/collections/edit',
  COLLECTION_BULK_EDIT: '/admin/collections/bulk-edit'
} as const;

@Component({
  selector: 'app-collection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    TranslatePipe,
    EmptyStateComponent
  ],
  templateUrl: './collection.component.html',
  styles: `
    .cursor-pointer {
      cursor: pointer;
    }

    .collection-row:hover {
      background-color: var(--bs-gray-100);
    }
  `
})
export class CollectionComponent extends ComponentBase implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private facade = inject(CollectionFacade);
  private router = inject(Router);

  allCollections = signal<EnrichedCollection[]>([]);
  searchText = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  // Filters
  filterEnabled = signal<boolean | undefined>(undefined);
  filterYear = signal<string>('');
  filterPin = signal<string>('');

  title = "Collection";
  subTitle = "Collections";

  filteredCollections: Signal<EnrichedCollection[]> = computed(() => {
    const collections = this.allCollections();
    const search = this.searchText().toLowerCase();

    if (!search) {
      return collections;
    }

    return collections.filter(collection => {
      const personData = collection.personData;
      const dateData = collection.dateData;

      return collection.pin.toLowerCase().includes(search) ||
             collection.userType.toLowerCase().includes(search) ||
             personData?.name?.toLowerCase().includes(search) ||
             personData?.responsible?.toLowerCase().includes(search) ||
             personData?.unit?.toLowerCase().includes(search) ||
             dateData?.date?.toLowerCase().includes(search);
    });
  });

  ngOnInit(): void {
    this.setupFacadeSubscriptions();
  }

  override getData() {
    this.loadCollections();
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

  private async loadCollections(): Promise<void> {
    try {
      const { collections, weaponCategories } = await firstValueFrom(
        this.facade.loadCollectionTable({
          enabled: this.filterEnabled(),
          year: this.filterYear() || undefined,
          pin: this.filterPin() || undefined
        })
      );

      console.log(collections,weaponCategories);

      // Process collections similar to your old implementation
      const processedCollections = collections
        .sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt))


      // Set the processed collections
      this.allCollections.set(processedCollections );

      // You can also store weapon categories if needed
      // this.weaponCategories = weaponCategories.map((wC: any) => {
      //   wC.children = wC?.children?.map((child: any) => {
      //     child.name = child.name?.slice(0, 20);
      //     return child;
      //   });
      //   return wC;
      // });

    } catch (error) {
      console.error('Error loading collections:', error);
      this.allCollections.set([]);
    }
  }

  searchCollections(event: any): void {
    const searchValue = event.target.value;
    this.searchText.set(searchValue);
  }

  refreshCollections(): void {
    this.facade.refreshCollections();
    this.loadCollections();
  }

  clearError(): void {
    this.facade.clearError();
  }

  createCollection(): void {
    this.router.navigate([PATHS.COLLECTION_CREATE]);
  }

  editCollection(collection: EnrichedCollection): void {
    console.log(collection);

    this.router.navigate([PATHS.COLLECTION_EDIT, collection.id]);
  }

  deleteCollection(collection: EnrichedCollection): void {
    if (confirm(`Are you sure you want to delete collection ${collection.pin}?`)) {
      this.facade.deleteCollection(collection.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(success => {
          if (success) {
            this.loadCollections();
          }
        });
    }
  }


  openBulkEditor(): void {
    this.router.navigate([PATHS.COLLECTION_BULK_EDIT]);
  }

  applyFilters(): void {
    this.loadCollections();
  }

  clearFilters(): void {
    this.filterEnabled.set(undefined);
    this.filterYear.set('');
    this.filterPin.set('');
    this.loadCollections();
  }

  getWeaponsCount(weaponsData: { [key: string]: number }): number {
    return Object.values(weaponsData || {}).reduce((sum, count) => sum + count, 0);
  }
}
