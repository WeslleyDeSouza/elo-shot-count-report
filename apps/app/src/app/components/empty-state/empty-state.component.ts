import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  imports: [CommonModule],
  template: `
    <div class="empty-state text-center py-5">
      <div class="empty-state-icon mb-3">
        <i [class]="iconClass()" class="empty-icon"></i>
      </div>
      <h5 class="empty-state-title text-muted">{{ title() }}</h5>
      @if(subtitle()) {
        <p class="empty-state-subtitle text-muted mb-3">{{ subtitle() }}</p>
      }
      @if(showAction()) {
        <ng-content></ng-content>
      }
    </div>
  `,
  styles: `
    .empty-state {
      padding: 3rem 1rem;
    }
    
    .empty-state-icon {
      opacity: 0.6;
    }
    
    .empty-icon {
      font-size: 4rem;
      color: #6c757d;
    }
    
    .empty-state-title {
      font-size: 1.25rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    
    .empty-state-subtitle {
      font-size: 0.875rem;
      line-height: 1.5;
    }
  `
})
export class EmptyStateComponent {
  title = input<string>('No Data');
  subtitle = input<string>('');
  iconClass = input<string>('ri-inbox-line');
  showAction = input<boolean>(true);
}