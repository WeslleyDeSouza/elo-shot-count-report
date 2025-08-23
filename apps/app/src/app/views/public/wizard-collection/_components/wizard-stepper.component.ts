import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { TranslatePipe } from '@app-galaxy/translate-ui';

export interface WizardStep {
  id: string;
  label: string;
  path: string;
}

@Component({
  selector: 'app-wizard-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div class="container-fluid py-3">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-10">
          <div class="steps-container">
            <div class="steps-progress">
              @for (step of steps(); track step.id; let i = $index) {
                <div class="step-item" [class]="getStepClass(i)">
                  <div class="step-circle">
                    @if (i < currentStepIndex()) {
                      <i class="ri-check-line"></i>
                    } @else {
                      <span>{{ i + 1 }}</span>
                    }
                  </div>
                  <div class="step-label">{{ step.label | translate }}</div>
                </div>
                @if (i < steps().length - 1) {
                  <div class="step-connector" [class.active]="i < currentStepIndex()"></div>
                }
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .steps-container {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .steps-progress {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      min-width: 120px;
    }

    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
      border: 2px solid #e9ecef;
      background: #fff;
      color: #6c757d;
      transition: all 0.3s ease;
    }

    .step-item.active .step-circle {
      background: #0d6efd;
      border-color: #0d6efd;
      color: #fff;
    }

    .step-item.completed .step-circle {
      background: #198754;
      border-color: #198754;
      color: #fff;
    }

    .step-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #6c757d;
      max-width: 100px;
      line-height: 1.2;
    }

    .step-item.active .step-label,
    .step-item.completed .step-label {
      color: #212529;
      font-weight: 600;
    }

    .step-connector {
      flex: 1;
      height: 2px;
      background: #e9ecef;
      margin: 0 0.5rem;
      margin-bottom: 1.5rem;
      min-width: 20px;
      transition: background 0.3s ease;
    }

    .step-connector.active {
      background: #198754;
    }

    @media (prefers-color-scheme: dark) {
      .steps-container {
        background: rgba(33, 37, 41, 0.95);
        color: #fff;
      }

      .step-circle {
        background: var(--bs-gray-800);
        border-color: var(--bs-gray-600);
        color: var(--bs-gray-300);
      }

      .step-item.active .step-circle {
        background: #0d6efd;
        border-color: #0d6efd;
        color: #fff;
      }

      .step-item.completed .step-circle {
        background: #198754;
        border-color: #198754;
        color: #fff;
      }

      .step-label {
        color: var(--bs-gray-400);
      }

      .step-item.active .step-label,
      .step-item.completed .step-label {
        color: var(--bs-gray-100);
      }

      .step-connector {
        background: var(--bs-gray-600);
      }

      .step-connector.active {
        background: #198754;
      }
    }
  `]
})
export class WizardStepperComponent {
  steps = input.required<WizardStep[]>();
  currentStepIndex = input.required<number>();

  getStepClass(index: number): string {
    const current = this.currentStepIndex();
    if (index < current) return 'completed';
    if (index === current) return 'active';
    return '';
  }
}