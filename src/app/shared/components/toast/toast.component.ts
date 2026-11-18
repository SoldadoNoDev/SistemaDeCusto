import { Component, inject } from '@angular/core';
import { FinOpsDataService } from '../../../core/services/finops-data.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (dataService.toast(); as toast) {
      <div class="toast-container">
        <div class="toast-card" [class]="'toast-' + toast.type">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') {
                <app-icon name="check" [size]="15" />
              }
              @case ('warning') {
                <app-icon name="alert-triangle" [size]="15" />
              }
              @case ('error') {
                <app-icon name="alert-circle" [size]="15" />
              }
              @default {
                <app-icon name="info" [size]="15" />
              }
            }
          </div>

          <div class="toast-content">
            <h4 class="toast-title">{{ toast.title }}</h4>
            <p class="toast-message">{{ toast.message }}</p>
          </div>

          <button class="toast-close" (click)="dataService.clearToast()">
            <app-icon name="x" [size]="13" />
          </button>

          <div class="toast-progress"></div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 10000;
        animation: slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .toast-card {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        min-width: 320px;
        max-width: 420px;
        padding: 14px 16px;
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        position: relative;
        overflow: hidden;
      }

      .toast-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: var(--radius-full);
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
        flex-shrink: 0;
        margin-top: 1px;
      }

      .toast-content {
        flex: 1;
      }

      .toast-title {
        font-size: 0.86rem;
        font-weight: 600;
        color: var(--text-primary);
        line-height: 1.2;
      }

      .toast-message {
        font-size: 0.78rem;
        color: var(--text-secondary);
        margin-top: 4px;
        line-height: 1.4;
      }

      .toast-close {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        line-height: 0;
        border-radius: 4px;
        transition: color var(--transition-fast);
      }
      .toast-close:hover {
        color: var(--text-primary);
      }

      .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        width: 100%;
        background-color: var(--accent-primary);
        opacity: 0.4;
        animation: toastCountdown 4.5s linear forwards;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes toastCountdown {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }
    `,
  ],
})
export class ToastComponent {
  readonly dataService = inject(FinOpsDataService);
}
