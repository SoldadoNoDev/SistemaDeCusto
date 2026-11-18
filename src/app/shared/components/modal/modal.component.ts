import { Component, input, output, HostListener } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (isOpen()) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div class="modal-dialog" [style.max-width]="maxWidth()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ title() }}</h3>
              @if (subtitle()) {
                <p class="modal-subtitle">{{ subtitle() }}</p>
              }
            </div>
            <button class="btn btn-ghost btn-icon" (click)="close.emit()" title="Fechar (Esc)">
              <app-icon name="x" [size]="16" />
            </button>
          </div>

          <div class="modal-body">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: var(--bg-modal-overlay);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
        animation: fadeIn 0.15s ease-out;
      }

      .modal-dialog {
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid var(--border-muted);
      }

      .modal-title {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--text-primary);
        letter-spacing: -0.01em;
      }

      .modal-subtitle {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 3px;
      }

      .modal-body {
        padding: 24px;
        overflow-y: auto;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes scaleUp {
        from {
          opacity: 0;
          transform: scale(0.97) translateY(4px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `,
  ],
})
export class ModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly maxWidth = input<string>('540px');

  readonly close = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}
