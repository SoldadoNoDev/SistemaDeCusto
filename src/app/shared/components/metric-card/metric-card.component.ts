import { Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="card metric-card">
      <div class="metric-top">
        <span class="metric-label">{{ label() }}</span>
        <div class="metric-icon-wrap">
          <app-icon [name]="icon()" [size]="15" />
        </div>
      </div>

      <div class="metric-value font-mono">{{ value() }}</div>

      <div class="metric-footer">
        @if (delta(); as d) {
          <span
            class="metric-delta"
            [class.delta-up]="deltaType() === 'up'"
            [class.delta-down]="deltaType() === 'down'"
            [class.delta-neutral]="deltaType() === 'neutral'"
          >
            @if (deltaType() === 'up') {
              <app-icon name="trending-up" [size]="12" />
            } @else if (deltaType() === 'down') {
              <app-icon name="trending-down" [size]="12" />
            }
            {{ d }}
          </span>
        }
        <span class="metric-subtext">{{ subtext() }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .metric-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 18px 20px;
        min-height: 125px;
        position: relative;
        overflow: hidden;
      }

      .metric-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      }

      .metric-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .metric-label {
        font-size: 0.78rem;
        font-weight: 500;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .metric-icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: var(--radius-sm);
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      .metric-value {
        font-size: 1.65rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.02em;
        margin: 10px 0 6px 0;
      }

      .metric-footer {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.75rem;
      }

      .metric-delta {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 1px 6px;
        border-radius: 4px;
        font-weight: 600;
        font-family: var(--font-mono);
        border: 1px solid var(--border-subtle);
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
      }

      .delta-up {
        border-color: #71717a;
      }

      .delta-down {
        border-color: #52525b;
      }

      .metric-subtext {
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class MetricCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input<string>('chart');
  readonly delta = input<string>('');
  readonly deltaType = input<'up' | 'down' | 'neutral'>('neutral');
  readonly subtext = input<string>('');
}
