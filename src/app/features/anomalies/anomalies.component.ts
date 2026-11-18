import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinOpsDataService } from '../../core/services/finops-data.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CostAnomaly } from '../../core/models/finops.model';

@Component({
  selector: 'app-anomalies',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="anomalies-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="header-pre-title">
            <span>DETECÇÃO DE PICOS INCOMUNS & ROOT-CAUSE ANALYSIS</span>
            <span class="separator">•</span>
            <span>DATADOG & CLOUDZERO ENGINE</span>
          </div>
          <h1 class="page-title">Central de Detecção de Anomalias</h1>
          <p class="page-subtitle">
            Modelos estatísticos avaliam o consumo diário contra o intervalo de confiança histórico (p95) para isolar desvios repentinos.
          </p>
        </div>
      </div>

      <!-- Anomaly Alert Banners -->
      <div class="anomalies-list">
        @for (item of dataService.anomalies(); track item.id) {
          @let isResolved = item.status === 'Resolved';
          @let isFalsePositive = item.status === 'False Positive';

          <div
            class="card anomaly-card"
            [class.border-resolved]="isResolved"
            [class.border-critical]="item.severity === 'Critical' && item.status === 'Investigating'"
          >
            <div class="anomaly-top">
              <div class="anomaly-badges">
                <span class="badge font-mono">{{ item.provider }}</span>
                <span
                  class="badge font-mono"
                  [class.badge-critical]="item.severity === 'Critical'"
                  [class.badge-warning]="item.severity === 'Warning'"
                >
                  {{ item.severity }}
                </span>
                <span class="anomaly-spike-badge font-mono">+{{ item.percentageSpike }}% DISPARADA</span>
              </div>

              <div class="status-selector">
                <span class="status-label">Status da Investigação:</span>
                <button
                  class="btn btn-sm"
                  [class.btn-primary]="item.status === 'Investigating'"
                  [class.btn-secondary]="item.status !== 'Investigating'"
                  (click)="dataService.updateAnomalyStatus(item.id, 'Investigating')"
                >
                  Investigando
                </button>
                <button
                  class="btn btn-sm"
                  [class.btn-primary]="item.status === 'Resolved'"
                  [class.btn-secondary]="item.status !== 'Resolved'"
                  (click)="dataService.updateAnomalyStatus(item.id, 'Resolved')"
                >
                  Resolvido
                </button>
                <button
                  class="btn btn-sm"
                  [class.btn-primary]="item.status === 'False Positive'"
                  [class.btn-secondary]="item.status !== 'False Positive'"
                  (click)="dataService.updateAnomalyStatus(item.id, 'False Positive')"
                >
                  Falso Positivo
                </button>
              </div>
            </div>

            <div class="anomaly-content">
              <h3 class="anomaly-service-name">{{ item.service }}</h3>
              <div class="anomaly-rca-box">
                <div class="rca-header">
                  <app-icon name="alert-triangle" [size]="14" />
                  <strong>Diagnóstico de Causa Raiz (RCA Automatizado)</strong>
                </div>
                <p class="rca-text">{{ item.rootCause }}</p>
              </div>
            </div>

            <div class="anomaly-bottom">
              <div class="anomaly-stat-chips font-mono">
                <div class="stat-chip">
                  <span class="chip-label">Baseline Normal:</span>
                  <span class="chip-val">\${{ item.normalSpend }}/dia</span>
                </div>
                <span class="chip-arrow">→</span>
                <div class="stat-chip">
                  <span class="chip-label">Pico Anômalo:</span>
                  <span class="chip-val chip-spike">\${{ item.anomalySpend }}/dia</span>
                </div>
                <div class="stat-chip">
                  <span class="chip-label">Detecção:</span>
                  <span class="chip-val">{{ item.detectedAt }}</span>
                </div>
              </div>

              <div class="anomaly-state-indicator font-mono">
                @if (isResolved) {
                  <span class="badge badge-success">✓ INCIDENTE RESOLVIDO</span>
                } @else if (isFalsePositive) {
                  <span class="badge badge-outline">FALSO POSITIVO CONFIRMADO</span>
                } @else {
                  <span class="badge badge-warning">⚠ ANOMALIA EM INVESTIGAÇÃO</span>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .anomalies-page {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
      }

      .header-pre-title {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        margin-bottom: 6px;
      }

      .separator {
        color: var(--border-focus);
      }

      .page-title {
        font-size: 1.65rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--text-primary);
      }

      .page-subtitle {
        font-size: 0.88rem;
        color: var(--text-secondary);
        margin-top: 4px;
        max-width: 650px;
      }

      .anomalies-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .anomaly-card {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 22px;
      }

      .border-critical {
        border-color: #ffffff;
      }

      .border-resolved {
        border-color: var(--border-muted);
        opacity: 0.85;
      }

      .anomaly-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
      }

      .anomaly-badges {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .anomaly-spike-badge {
        font-size: 0.76rem;
        font-weight: 700;
        padding: 2px 8px;
        background-color: var(--accent-primary);
        color: var(--text-inverse);
        border-radius: var(--radius-sm);
      }

      .status-selector {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .status-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-right: 4px;
      }

      .anomaly-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .anomaly-service-name {
        font-size: 1.15rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .anomaly-rca-box {
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-muted);
        border-radius: var(--radius-sm);
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .rca-header {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.78rem;
        color: var(--text-primary);
      }

      .rca-text {
        font-size: 0.84rem;
        color: var(--text-secondary);
        line-height: 1.45;
      }

      .anomaly-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 14px;
        border-top: 1px solid var(--border-muted);
        padding-top: 14px;
      }

      .anomaly-stat-chips {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.78rem;
        flex-wrap: wrap;
      }

      .stat-chip {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .chip-label {
        color: var(--text-muted);
      }

      .chip-val {
        color: var(--text-primary);
        font-weight: 600;
      }

      .chip-spike {
        color: #ffffff;
        font-weight: 700;
      }

      .chip-arrow {
        color: var(--text-muted);
      }
    `,
  ],
})
export class AnomaliesComponent {
  readonly dataService = inject(FinOpsDataService);
}
