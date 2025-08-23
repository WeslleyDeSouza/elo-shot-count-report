import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject, Optional } from '@angular/core';
import { ComponentFormBase } from "@app-galaxy/sdk-ui";
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { NgbNavModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FileUploaderComponent } from '../file-uploader/file-uploader.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import {dataImporterArealMock, dataImporterWeaponMock, dataImporterArealTemplateMock, dataImporterWeaponTemplateMock} from "./data-importer.mock";

export type ImportType = 'areal' | 'weapon';

export interface ImportResult {
  success: boolean;
  message?: string;
  data?: any;
}

export interface ImportSummary {
  totalProcessed: number;
  successfulImports: number;
  failedImports: number;
  successfulCategories: string[];
  failedCategories: string[];
  successfulItems: string[];
  failedItems: string[];
}

export interface BaseData {
  id: string;
  name: string;
  code: number;
}

export interface ArealData extends BaseData{
  id: string;
  name: string;
  code: number;
  areas: {
    id: string;
    categoryId: string;
    name: string;
    enabled: boolean;
  }[];
}

export interface WeaponData extends BaseData{
  id: string;
  name: string;
  code: number;
  weapons: {
    id: string;
    categoryId: string;
    name: string;
    nameDe: string;
    nameFr: string;
    nameIt: string;
    enabled: boolean;
    inWeight: boolean;
    deletedAt?: string;
  }[];
}

export interface CollectionData {}

@Component({
  selector: 'app-data-importer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, NgbNavModule, FileUploaderComponent, ReactiveFormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">
        <i class="ri-upload-line me-2"></i>
        {{ 'admin.common.import_data' | translate }}
      </h5>
      <button type="button" class="btn-close" (click)="onCancel()"></button>
    </div>

    <div class="modal-body">
      @if (!showResults()) {
        <nav>
          <div ngbNav #nav="ngbNav" [activeId]="activeTabId()" (activeIdChange)="activeTabId.set($event)" class="nav-tabs">
            <ng-container ngbNavItem="1">
              <button ngbNavLink>
                <i class="ri-upload-cloud-line me-2"></i>
                {{ 'admin.common.file_upload' | translate }}
              </button>
              <ng-template ngbNavContent>
                <div class="py-3">
                  <app-file-uploader
                    [manuallyUpload]="true"
                    [form]="uploadForm"
                    controlName="file"
                    (fileSelected)="onFileSelected($event)"
                    [showPreview]="false">
                  </app-file-uploader>

                  <div class="mt-3 mb-4 d-flex justify-content-between text-secondary">
                    <span>{{ 'admin.common.supported_formats' | translate }}: JSON, XLSX</span>
                    <span>{{ 'admin.common.maximum_size' | translate }}: 25MB</span>
                  </div>

                  <div class="d-flex justify-content-between p-3 bg-light rounded">
                    <div>
                      <h6>
                        <i class="ri-download-line me-2"></i>
                        {{ 'admin.common.download_template' | translate }}
                      </h6>
                      <p class="mb-0 text-muted">
                        Laden Sie eine Beispieldatei mit der korrekten Struktur herunter.
                      </p>
                    </div>
                    <div>
                      <button type="button" (click)="downloadTemplate()" class="btn btn-outline-primary">
                        <i class="ri-download-line"></i>
                        {{ 'admin.common.download_template' | translate }}
                      </button>
                    </div>
                  </div>
                </div>
              </ng-template>
            </ng-container>

            <ng-container ngbNavItem="2">
              <button ngbNavLink>
                <i class="ri-code-line me-2"></i>
                {{ 'admin.common.json_import' | translate }}
              </button>
              <ng-template ngbNavContent>
                <div class="py-3">
                  <label for="jsonInput" class="form-label">
                    {{ 'admin.common.paste_json' | translate }}
                  </label>
                  <textarea
                    id="jsonInput"
                    class="form-control"
                    rows="12"
                    [placeholder]="getJsonPlaceholder()"
                    [formControl]="jsonInputControl"
                    (input)="jsonInputValue.set($any($event.target).value)">
                  </textarea>
                  <div class="mt-2">
                    <small class="text-muted">
                      Fügen Sie hier Ihre JSON-Daten entsprechend der Struktur ein.
                    </small>
                  </div>
                </div>
              </ng-template>
            </ng-container>
          </div>
        </nav>
        <div [ngbNavOutlet]="nav" class="mt-2"></div>
      } @else {
        <div class="import-results">
          <div class="text-center mb-4">
            <div class="mb-3">
              @if (importSummary()?.successfulImports === importSummary()?.totalProcessed) {
                <i class="ri-checkbox-circle-fill text-success" style="font-size: 3rem;"></i>
              } @else if ($any(importSummary())?.successfulImports > 0) {
                <i class="ri-error-warning-fill text-warning" style="font-size: 3rem;"></i>
              } @else {
                <i class="ri-close-circle-fill text-danger" style="font-size: 3rem;"></i>
              }
            </div>
            <h5>{{ 'admin.common.import_results' | translate }}</h5>
          </div>

          @if (importSummary(); as summary) {
            <div class="row mb-4">
              <div class="col-4 text-center">
                <div class="card bg-primary text-white">
                  <div class="card-body py-2">
                    <h3 class="mb-1">{{ summary.totalProcessed }}</h3>
                    <small>Total</small>
                  </div>
                </div>
              </div>
              <div class="col-4 text-center">
                <div class="card bg-success text-white">
                  <div class="card-body py-2">
                    <h3 class="mb-1">{{ summary.successfulImports }}</h3>
                    <small>{{ 'admin.common.successful_imports' | translate }}</small>
                  </div>
                </div>
              </div>
              <div class="col-4 text-center">
                <div class="card bg-danger text-white">
                  <div class="card-body py-2">
                    <h3 class="mb-1">{{ summary.failedImports }}</h3>
                    <small>{{ 'admin.common.failed_imports' | translate }}</small>
                  </div>
                </div>
              </div>
            </div>

            @if (summary.successfulCategories.length > 0 || summary.failedCategories.length > 0) {
              <div class="mb-3">
                <h6>{{ 'admin.common.categories' | translate }}</h6>
                @if (summary.successfulCategories.length > 0) {
                  <div class="mb-2">
                    <small class="text-success fw-bold">
                      <i class="ri-check-line"></i> {{ 'admin.common.successful_imports' | translate }}:
                    </small>
                    <ul class="list-unstyled ms-3 mb-0">
                      @for (category of summary.successfulCategories; track category) {
                        <li class="text-success">
                          <i class="ri-check-line"></i> {{ category }}
                        </li>
                      }
                    </ul>
                  </div>
                }
                @if (summary.failedCategories.length > 0) {
                  <div>
                    <small class="text-danger fw-bold">
                      <i class="ri-close-line"></i> {{ 'admin.common.failed_imports' | translate }}:
                    </small>
                    <ul class="list-unstyled ms-3 mb-0">
                      @for (category of summary.failedCategories; track category) {
                        <li class="text-danger">
                          <i class="ri-close-line"></i> {{ category }}
                        </li>
                      }
                    </ul>
                  </div>
                }
              </div>
            }

            @if (summary.successfulItems.length > 0 || summary.failedItems.length > 0) {
              <div>
                <h6>{{ 'admin.common.items' | translate }}</h6>
                @if (summary.successfulItems.length > 0) {
                  <div class="mb-2">
                    <small class="text-success fw-bold">
                      <i class="ri-check-line"></i> {{ 'admin.common.successful_imports' | translate }}:
                    </small>
                    <ul class="list-unstyled ms-3 mb-0">
                      @for (item of summary.successfulItems; track item) {
                        <li class="text-success">
                          <i class="ri-check-line"></i> {{ item }}
                        </li>
                      }
                    </ul>
                  </div>
                }
                @if (summary.failedItems.length > 0) {
                  <div>
                    <small class="text-danger fw-bold">
                      <i class="ri-close-line"></i> {{ 'admin.common.failed_imports' | translate }}:
                    </small>
                    <ul class="list-unstyled ms-3 mb-0">
                      @for (item of summary.failedItems; track item) {
                        <li class="text-danger">
                          <i class="ri-close-line"></i> {{ item }}
                        </li>
                      }
                    </ul>
                  </div>
                }
              </div>
            }
          }
        </div>
      }
    </div>

    <div class="modal-footer">
      @if (!showResults()) {
        <div class="d-flex justify-content-between align-items-center w-100">
          <div class="text-muted small">
            @if (!canImport()) {
              <i class="ri-information-line me-1"></i>
              {{ getImportRequirementMessage() | translate }}
            }
          </div>
          <div>
            <button type="button" class="btn btn-secondary me-2" (click)="onCancel()">
              {{ 'admin.common.cancel' | translate }}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              [disabled]="!canImport()"
              (click)="startImport()">
              <i class="ri-upload-line me-2"></i>
              {{ 'admin.common.import' | translate }}
            </button>
          </div>
        </div>
      } @else {
        <button type="button" class="btn btn-primary" (click)="onCancel()">
          {{ 'admin.common.close' | translate }}
        </button>
      }
    </div>
  `,
  styles: [`
    .import-results {
      max-height: 400px;
      overflow-y: auto;
    }

    .card {
      border: none;
      border-radius: 8px;
    }

    .nav-tabs {
      border-bottom: 1px solid #dee2e6;
    }

    .nav-tabs .nav-link {
      border: none;
      border-bottom: 2px solid transparent;
      color: #6c757d;
    }

    .nav-tabs .nav-link.active {
      border-bottom-color: #0d6efd;
      color: #0d6efd;
      background: none;
    }
  `],
  providers:[]
})
export class DataImporterComponent extends ComponentFormBase {
  importType = signal<ImportType>('areal');
  onImport = output<{ type: ImportType; data: ArealData[] | WeaponData[] }>();

  private modalRef = inject(NgbModalRef, { optional: true });

  activeTabId = signal<number>(1);
  showResults = signal(false);
  importSummary = signal<ImportSummary | null>(null);
  selectedFile = signal<File | null>(null);
  jsonInputValue = signal<string>('');

  uploadForm = new FormGroup({
    file: new FormControl('')
  });

  jsonInputControl = new FormControl('');

  canImport = computed(() => {
    if (+this.activeTabId() === 1) {
      return !!this.selectedFile();
    } else {
      const jsonValue = this.jsonInputValue();
      return jsonValue && jsonValue.trim().length > 0 && this.isValidJson(jsonValue);
    }
  });

  getData(): void {}

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
  }

  getImportRequirementMessage(): string {
    if (+this.activeTabId() === 1) {
      return 'admin.common.select_file_to_upload';
    } else {
      const jsonValue = this.jsonInputValue();
      if (!jsonValue || jsonValue.trim().length === 0) {
        return 'admin.common.enter_valid_json';
      } else if (!this.isValidJson(jsonValue)) {
        return 'admin.common.invalid_json_format';
      }
    }
    return '';
  }

  getJsonPlaceholder(): string {
    if (this.importType() === 'areal') {
      return JSON.stringify(dataImporterArealMock, null, 2);
    } else {
      return JSON.stringify(dataImporterWeaponMock, null, 2);
    }
  }

  downloadTemplate(): void {
    const data = this.importType() === 'areal' ? this.getArealTemplate() : this.getWeaponTemplate();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    //
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.importType()}-template.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private getArealTemplate(): ArealData {
    return dataImporterArealTemplateMock as ArealData;
  }

  private getWeaponTemplate(): WeaponData {
    return dataImporterWeaponTemplateMock as WeaponData;
  }

  async startImport(): Promise<void> {
    let data: ArealData[] | WeaponData[] = [];

    try {
      if (+this.activeTabId() === 1 && this.selectedFile()) {
        data = await this.processFile(this.selectedFile()!);
      } else if (+this.activeTabId() === 2) {
        data = this.processJson(this.jsonInputValue());
      }

      // Emit all data to parent component for processing
      this.onImport.emit({ type: this.importType(), data });

      // Wait a bit for processing
      await this.delay(1000);

      // Generate summary (parent component handles actual saving)
      const summary = this.generateImportSummary(data);
      this.importSummary.set(summary);
      this.showResults.set(true);

      console.log('Import completed with summary:', summary);
    } catch (error) {
      console.error('Import failed:', error);
      // Show error in the results
      this.importSummary.set({
        totalProcessed: 0,
        successfulImports: 0,
        failedImports: 1,
        successfulCategories: [],
        failedCategories: ['Import failed: ' + (error as Error).message],
        successfulItems: [],
        failedItems: []
      });
      this.showResults.set(true);
    }
  }

  private async processImportsInChunks(data: ArealData[] | WeaponData[]): Promise<ImportSummary> {
    const CHUNK_SIZE = 10; // Process 10 items at a time
    const chunks = this.chunkArray(data, CHUNK_SIZE);

    let totalSuccessful = 0;
    let totalFailed = 0;
    const successfulCategories: string[] = [];
    const failedCategories: string[] = [];
    const successfulItems: string[] = [];
    const failedItems: string[] = [];

    for (const chunk of chunks) {
      try {
        // Emit chunk for processing
        this.onImport.emit({ type: this.importType(), data: <any>chunk });

        // Simulate processing delay
        await this.delay(100);

        // Process results (this would normally come from the service)
        chunk.forEach((item) => {
          try {
            const baseItem = item as BaseData;
            successfulCategories.push(baseItem.name);
            totalSuccessful++;

            if (this.importType() === 'areal') {
              const arealData = item as ArealData;
              successfulItems.push(...arealData.areas.map(area => area.name));
            } else {
              const weaponData = item as WeaponData;
              successfulItems.push(...weaponData.weapons.map(weapon => weapon.name));
            }
          } catch (error) {
            const baseItem = item as BaseData;
            failedCategories.push(baseItem.name);
            totalFailed++;
          }
        });
      } catch (error) {
        chunk.forEach(item => {
          const baseItem = item as BaseData;
          failedCategories.push(baseItem.name);
          totalFailed++;
        });
      }
    }

    return {
      totalProcessed: data.length,
      successfulImports: totalSuccessful,
      failedImports: totalFailed,
      successfulCategories,
      failedCategories,
      successfulItems,
      failedItems
    };
  }

  private generateImportSummary(data: ArealData[] | WeaponData[]): ImportSummary {
    const summary: ImportSummary = {
      totalProcessed: data.length,
      successfulImports: data.length, // Assume success for UI demo
      failedImports: 0,
      successfulCategories: data.map(item => item.name),
      failedCategories: [],
      successfulItems: [],
      failedItems: []
    };

    // Add items to the summary
    data.forEach(item => {
      if (this.importType() === 'areal') {
        const arealData = item as ArealData;
        summary.successfulItems.push(...arealData.areas.map(area => area.name));
      } else {
        const weaponData = item as WeaponData;
        summary.successfulItems.push(...weaponData.weapons.map(weapon => weapon.name));
      }
    });

    return summary;
  }

  private chunkArray(array: (ArealData | WeaponData)[], size: number): (ArealData | WeaponData)[][] {
    const chunks: (ArealData | WeaponData)[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async processFile(file: File): Promise<ArealData[] | WeaponData[]> {
    const text = await file.text();

    if (file.name.endsWith('.json')) {
      return this.processJson(text);
    } else if (file.name.endsWith('.xlsx')) {
      // For XLSX files, you would need to implement Excel parsing
      // For now, just throw an error
      throw new Error('XLSX import not implemented yet');
    }

    throw new Error('Unsupported file format');
  }

  private processJson(jsonString: string): ArealData[] | WeaponData[] {
    try {
      const parsed = JSON.parse(jsonString);

      // Handle both single objects and arrays
      if (Array.isArray(parsed)) {
        return parsed;
      } else {
        return [parsed];
      }
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  private isValidJson(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  protected onCancel(): void {
    this.modalRef?.close();
  }

  protected onSave(): void {
    this.modalRef?.close(true);
  }
}
