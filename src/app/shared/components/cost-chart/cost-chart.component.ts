import { Component, input, signal, computed } from '@angular/core';
import { DailySpendPoint } from '../../../core/models/finops.model';

@Component({
  selector: 'app-cost-chart',
  standalone: true,
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-indicator solid"></span>
            <span class="legend-label">Gasto Realizado ($)</span>
          </div>
          <div class="legend-item">
            <span class="legend-indicator dashed"></span>
            <span class="legend-label">Projeção de Fechamento (Forecast)</span>
          </div>
        </div>

        @if (hoveredPoint(); as pt) {
          <div class="chart-tooltip-badge font-mono">
            <span class="tooltip-date">{{ pt.day }}:</span>
            @if (pt.spend > 0) {
              <span class="tooltip-val">\${{ pt.spend.toLocaleString('en-US') }} (Real)</span>
            } @else {
              <span class="tooltip-val">\${{ (pt.forecast || 0).toLocaleString('en-US') }} (Proj.)</span>
            }
          </div>
        }
      </div>

      <div class="chart-svg-wrapper">
        <svg
          class="chart-svg"
          viewBox="0 0 900 280"
          preserveAspectRatio="none"
          (mouseleave)="clearHover()"
        >
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--text-primary)" stop-opacity="0.22" />
              <stop offset="100%" stop-color="var(--text-primary)" stop-opacity="0.0" />
            </linearGradient>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--text-muted)" stop-opacity="0.10" />
              <stop offset="100%" stop-color="var(--text-muted)" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Horizontal Grid Lines -->
          @for (y of gridYLines(); track y.val) {
            <line
              x1="50"
              [attr.y1]="y.coord"
              x2="880"
              [attr.y2]="y.coord"
              stroke="var(--border-subtle)"
              stroke-width="1"
              stroke-dasharray="3 3"
              opacity="0.6"
            />
            <text
              x="42"
              [attr.y]="y.coord + 4"
              text-anchor="end"
              class="chart-axis-label font-mono"
            >
              \${{ y.val }}
            </text>
          }

          <!-- Actual Spend Area Fill -->
          <path [attr.d]="actualAreaPath()" fill="url(#actualGradient)" />

          <!-- Actual Spend Line -->
          <path
            [attr.d]="actualLinePath()"
            fill="none"
            stroke="var(--text-primary)"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Forecast Area Fill -->
          <path [attr.d]="forecastAreaPath()" fill="url(#forecastGradient)" />

          <!-- Forecast Line (Dashed) -->
          <path
            [attr.d]="forecastLinePath()"
            fill="none"
            stroke="var(--text-secondary)"
            stroke-width="2"
            stroke-dasharray="4 4"
            stroke-linecap="round"
          />

          <!-- Data Points with Hover Detection -->
          @for (point of computedPoints(); track point.day; let idx = $index) {
            <g
              class="chart-point-group"
              (mouseenter)="setHover(point)"
              style="cursor: pointer;"
            >
              <!-- Transparent large hit area -->
              <rect
                [attr.x]="point.x - 12"
                y="10"
                width="24"
                height="240"
                fill="transparent"
              />

              @if (point.isActual) {
                <circle
                  [attr.cx]="point.x"
                  [attr.cy]="point.y"
                  r="3.5"
                  fill="var(--bg-primary)"
                  stroke="var(--text-primary)"
                  stroke-width="2"
                />
              } @else {
                <circle
                  [attr.cx]="point.x"
                  [attr.cy]="point.y"
                  r="3"
                  fill="var(--bg-primary)"
                  stroke="var(--text-muted)"
                  stroke-width="1.5"
                />
              }

              <!-- Active hover crosshair and pulse -->
              @if (hoveredPoint()?.day === point.day) {
                <line
                  [attr.x1]="point.x"
                  y1="20"
                  [attr.x2]="point.x"
                  y2="250"
                  stroke="var(--accent-primary)"
                  stroke-width="1"
                  stroke-dasharray="2 2"
                />
                <circle
                  [attr.cx]="point.x"
                  [attr.cy]="point.y"
                  r="6"
                  fill="none"
                  stroke="var(--accent-primary)"
                  stroke-width="2"
                />
              }
            </g>
          }

          <!-- X-Axis Labels (Filtered to avoid crowd) -->
          @for (label of xLabels(); track label.day) {
            <text
              [attr.x]="label.x"
              y="272"
              text-anchor="middle"
              class="chart-axis-label font-mono"
            >
              {{ label.day }}
            </text>
          }
        </svg>
      </div>
    </div>
  `,
  styles: [
    `
      .chart-container {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .chart-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        flex-wrap: wrap;
        gap: 10px;
      }

      .chart-legend {
        display: flex;
        align-items: center;
        gap: 18px;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.78rem;
        color: var(--text-secondary);
      }

      .legend-indicator {
        width: 18px;
        height: 2px;
        border-radius: 2px;
      }

      .legend-indicator.solid {
        background-color: var(--text-primary);
      }

      .legend-indicator.dashed {
        background: repeating-linear-gradient(
          90deg,
          var(--text-secondary),
          var(--text-secondary) 4px,
          transparent 4px,
          transparent 8px
        );
      }

      .chart-tooltip-badge {
        font-size: 0.8rem;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-active);
        padding: 3px 10px;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .tooltip-date {
        color: var(--text-muted);
      }

      .tooltip-val {
        color: var(--text-primary);
        font-weight: 600;
      }

      .chart-svg-wrapper {
        width: 100%;
        overflow-x: auto;
      }

      .chart-svg {
        width: 100%;
        height: 280px;
        display: block;
      }

      .chart-axis-label {
        font-size: 10px;
        fill: var(--text-muted);
      }
    `,
  ],
})
export class CostChartComponent {
  readonly points = input.required<DailySpendPoint[]>();
  readonly hoveredPoint = signal<DailySpendPoint | null>(null);

  readonly minVal = 1500;
  readonly maxVal = 3800;
  readonly svgWidth = 900;
  readonly svgHeight = 280;
  readonly chartLeft = 55;
  readonly chartRight = 875;
  readonly chartTop = 30;
  readonly chartBottom = 250;

  readonly gridYLines = computed(() => {
    const values = [2000, 2500, 3000, 3500];
    return values.map((val) => ({
      val,
      coord: this.getYCoord(val),
    }));
  });

  readonly computedPoints = computed(() => {
    const data = this.points();
    const count = data.length;
    const xStep = (this.chartRight - this.chartLeft) / Math.max(1, count - 1);

    return data.map((pt, i) => {
      const isActual = pt.spend > 0;
      const val = isActual ? pt.spend : pt.forecast || 0;
      return {
        ...pt,
        x: Math.round(this.chartLeft + i * xStep),
        y: Math.round(this.getYCoord(val)),
        isActual,
      };
    });
  });

  readonly xLabels = computed(() => {
    const computedList = this.computedPoints();
    // Return every 5th item for clean readability
    return computedList.filter((_, idx) => idx % 5 === 0 || idx === computedList.length - 1);
  });

  readonly actualLinePath = computed(() => {
    const pts = this.computedPoints().filter((p) => p.isActual);
    if (pts.length === 0) return '';
    return pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  });

  readonly actualAreaPath = computed(() => {
    const pts = this.computedPoints().filter((p) => p.isActual);
    if (pts.length === 0) return '';
    const first = pts[0];
    const last = pts[pts.length - 1];
    const line = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return `${line} L ${last.x} ${this.chartBottom} L ${first.x} ${this.chartBottom} Z`;
  });

  readonly forecastLinePath = computed(() => {
    const all = this.computedPoints();
    const actuals = all.filter((p) => p.isActual);
    const forecasts = all.filter((p) => !p.isActual);
    if (forecasts.length === 0) return '';
    // Connect from last actual point
    const startPoint = actuals[actuals.length - 1] || forecasts[0];
    const combined = [startPoint, ...forecasts];
    return combined.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  });

  readonly forecastAreaPath = computed(() => {
    const all = this.computedPoints();
    const actuals = all.filter((p) => p.isActual);
    const forecasts = all.filter((p) => !p.isActual);
    if (forecasts.length === 0) return '';
    const startPoint = actuals[actuals.length - 1] || forecasts[0];
    const combined = [startPoint, ...forecasts];
    const first = combined[0];
    const last = combined[combined.length - 1];
    const line = combined.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return `${line} L ${last.x} ${this.chartBottom} L ${first.x} ${this.chartBottom} Z`;
  });

  private getYCoord(val: number): number {
    const ratio = (val - this.minVal) / (this.maxVal - this.minVal);
    const clamped = Math.max(0, Math.min(1, ratio));
    return this.chartBottom - clamped * (this.chartBottom - this.chartTop);
  }

  setHover(point: DailySpendPoint): void {
    this.hoveredPoint.set(point);
  }

  clearHover(): void {
    this.hoveredPoint.set(null);
  }
}
