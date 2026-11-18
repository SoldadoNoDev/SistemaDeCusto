import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinOpsDataService } from '../../core/services/finops-data.service';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { CostChartComponent } from '../../shared/components/cost-chart/cost-chart.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CostAnomaly } from '../../core/models/finops.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MetricCardComponent, CostChartComponent, IconComponent],
  template: `
    <div class="dashboard-page">
      <!-- Section Header -->
      <div class="page-header">
        <div>
          <div class="header-pre-title">
            <span class="live-dot"></span>
            <span>TELEMETRIA MULTI-CLOUD ATIVA</span>
            <span class="separator">•</span>
            <span>AWS / GCP / AZURE / KUBERNETES</span>
          </div>
          <h1 class="page-title">Visão Geral Executiva de Custos</h1>
          <p class="page-subtitle">
            Consolidação financeira em tempo real, métricas preditivas de fechamento e detecção de anomalias.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-secondary btn-sm" (click)="dataService.resetToDefaultDemoData()">
            <app-icon name="refresh" [size]="14" />
            Restaurar Demo
          </button>
          <button class="btn btn-primary btn-sm" (click)="dataService.setTab('budgets')">
            <app-icon name="plus" [size]="14" />
            Novo Orçamento
          </button>
        </div>
      </div>

      <!-- KPI Metrics Row -->
      <div class="metrics-grid">
        <app-metric-card
          label="Gasto Acumulado (MTD)"
          [value]="'$' + (dataService.totalSpendMTD() | number: '1.2-2')"
          icon="wallet"
          [delta]="'+' + dataService.spendDeltaPercentage() + '%'"
          deltaType="up"
          subtext="vs mês anterior"
        />

        <app-metric-card
          label="Projeção Fim de Mês"
          [value]="'$' + (dataService.projectedSpendEndOfMonth() | number: '1.0-0')"
          icon="chart"
          delta="Forecast"
          deltaType="neutral"
          subtext="Run-rate diário consolidado"
        />

        <app-metric-card
          label="Economia em Aberto"
          [value]="'$' + (dataService.totalSavingsPotential() | number: '1.0-0') + '/mês'"
          icon="sparkles"
          delta="Rightsizing"
          deltaType="down"
          subtext="Em 5 oportunidades ativas"
        />

        <app-metric-card
          label="Economia Realizada"
          [value]="'$' + (dataService.realizedSavings() | number: '1.0-0') + '/mês'"
          icon="check"
          delta="Aplicada"
          deltaType="down"
          subtext="Reduções validadas"
        />

        <app-metric-card
          label="Anomalias Críticas"
          [value]="dataService.activeAnomaliesCount().toString()"
          icon="alert-triangle"
          [delta]="dataService.activeAnomaliesCount() > 0 ? 'Atenção' : 'Estável'"
          [deltaType]="dataService.activeAnomaliesCount() > 0 ? 'up' : 'neutral'"
          subtext="Requerem investigação"
        />

        <app-metric-card
          label="Custo Médio / Integrante"
          [value]="'$' + (dataService.averageCostPerMember() | number: '1.0-0')"
          icon="users"
          delta="Unit Econ"
          deltaType="neutral"
          subtext="Em 4 times corporativos"
        />
      </div>

      <!-- Main Visualizations Grid -->
      <div class="charts-row">
        <!-- Interactive Spend Trend Line Chart -->
        <div class="card chart-card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Curva Histórica de Gasto Diário & Forecast</h2>
              <p class="card-subtitle">
                Evolução diária (1 a 18 de Nov) e projeção preditiva até o final do ciclo de faturamento.
              </p>
            </div>
            <span class="badge badge-outline font-mono">Novembro 2026</span>
          </div>
          <app-cost-chart [points]="dataService.dailySpendTrend" />
        </div>

        <!-- Multi-Cloud Breakdown Column -->
        <div class="card distribution-card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Composição por Nuvem</h2>
              <p class="card-subtitle">Participação percentual no spend consolidado</p>
            </div>
            <span class="badge font-mono">4 Provedores</span>
          </div>

          <div class="provider-bars">
            <!-- AWS -->
            <div class="provider-item">
              <div class="provider-info">
                <span class="provider-name">
                  <span class="provider-bullet bullet-aws"></span>
                  Amazon Web Services (AWS)
                </span>
                <span class="provider-val font-mono">
                  \${{ dataService.providerDistribution().AWS.amount | number: '1.0-0' }} ({{
                    dataService.providerDistribution().AWS.percent
                  }}%)
                </span>
              </div>
              <div class="progress-track">
                <div
                  class="progress-fill"
                  [style.width.%]="dataService.providerDistribution().AWS.percent"
                ></div>
              </div>
            </div>

            <!-- GCP -->
            <div class="provider-item">
              <div class="provider-info">
                <span class="provider-name">
                  <span class="provider-bullet bullet-gcp"></span>
                  Google Cloud Platform (GCP)
                </span>
                <span class="provider-val font-mono">
                  \${{ dataService.providerDistribution().GCP.amount | number: '1.0-0' }} ({{
                    dataService.providerDistribution().GCP.percent
                  }}%)
                </span>
              </div>
              <div class="progress-track">
                <div
                  class="progress-fill"
                  [style.width.%]="dataService.providerDistribution().GCP.percent"
                ></div>
              </div>
            </div>

            <!-- Azure -->
            <div class="provider-item">
              <div class="provider-info">
                <span class="provider-name">
                  <span class="provider-bullet bullet-azure"></span>
                  Microsoft Azure
                </span>
                <span class="provider-val font-mono">
                  \${{ dataService.providerDistribution().Azure.amount | number: '1.0-0' }} ({{
                    dataService.providerDistribution().Azure.percent
                  }}%)
                </span>
              </div>
              <div class="progress-track">
                <div
                  class="progress-fill"
                  [style.width.%]="dataService.providerDistribution().Azure.percent"
                ></div>
              </div>
            </div>

            <!-- Kubernetes -->
            <div class="provider-item">
              <div class="provider-info">
                <span class="provider-name">
                  <span class="provider-bullet bullet-k8s"></span>
                  Kubernetes Clusters (Dedicated)
                </span>
                <span class="provider-val font-mono">
                  \${{ dataService.providerDistribution().Kubernetes.amount | number: '1.0-0' }} ({{
                    dataService.providerDistribution().Kubernetes.percent
                  }}%)
                </span>
              </div>
              <div class="progress-track">
                <div
                  class="progress-fill"
                  [style.width.%]="dataService.providerDistribution().Kubernetes.percent"
                ></div>
              </div>
            </div>
          </div>

          <div class="summary-box">
            <div class="summary-stat">
              <span class="summary-label">Média de Consumo de Orçamento</span>
              <span class="summary-value font-mono">{{ dataService.averageBudgetHealth() }}%</span>
            </div>
            <div class="summary-action">
              <button class="btn btn-secondary btn-sm" (click)="dataService.setTab('cost-explorer')">
                Ver Detalhes no Explorer
                <app-icon name="chart" [size]="13" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Lower Sections: Budgets Overview & Anomalies Feed -->
      <div class="grid-two-columns">
        <!-- Budgets Quick Health -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Monitoramento de Orçamentos Ativos</h2>
              <p class="card-subtitle">Tetos e limiares de aviso em tempo real</p>
            </div>
            <button class="btn btn-ghost btn-sm" (click)="dataService.setTab('budgets')">
              Gerenciar CRUD
              <app-icon name="wallet" [size]="13" />
            </button>
          </div>

          <div class="budget-list">
            @for (budget of dataService.budgets().slice(0, 4); track budget.id) {
              @let pct = (budget.currentSpend / budget.amount) * 100;
              <div class="budget-quick-item">
                <div class="budget-quick-header">
                  <div>
                    <span class="budget-quick-name">{{ budget.name }}</span>
                    <span class="budget-scope-badge badge font-mono">{{ budget.provider }}</span>
                  </div>
                  <div class="budget-quick-numbers font-mono">
                    <span class="spend-now">\${{ budget.currentSpend | number: '1.0-0' }}</span>
                    <span class="spend-limit">/ \${{ budget.amount | number: '1.0-0' }}</span>
                    <span
                      class="spend-pct"
                      [class.text-danger]="pct >= 100"
                      [class.text-warning]="pct >= 80 && pct < 100"
                    >
                      ({{ pct | number: '1.1-1' }}%)
                    </span>
                  </div>
                </div>

                <div class="progress-track">
                  <div
                    class="progress-fill"
                    [class.bar-exceeded]="pct >= 100"
                    [class.bar-warning]="pct >= 80 && pct < 100"
                    [style.width.%]="pct > 100 ? 100 : pct"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Anomaly Center Quick Feed -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Anomalias de Custo Recentes</h2>
              <p class="card-subtitle">Picos não previstos detectados por inteligência estatística</p>
            </div>
            <button class="btn btn-ghost btn-sm" (click)="dataService.setTab('anomalies')">
              Ver Todas ({{ dataService.anomalies().length }})
              <app-icon name="alert-triangle" [size]="13" />
            </button>
          </div>

          <div class="anomaly-quick-list">
            @for (anomaly of dataService.anomalies(); track anomaly.id) {
              <div class="anomaly-quick-item">
                <div class="anomaly-header">
                  <div class="anomaly-title-area">
                    <span class="anomaly-icon-badge" [class.badge-critical]="anomaly.severity === 'Critical'">
                      <app-icon name="alert-triangle" [size]="13" />
                    </span>
                    <strong class="anomaly-service">{{ anomaly.service }}</strong>
                    <span class="badge font-mono">{{ anomaly.provider }}</span>
                  </div>
                  <span class="anomaly-spike-badge font-mono">+{{ anomaly.percentageSpike }}%</span>
                </div>

                <p class="anomaly-rca">{{ anomaly.rootCause }}</p>

                <div class="anomaly-footer">
                  <span class="anomaly-date font-mono">{{ anomaly.detectedAt }}</span>
                  <div class="anomaly-actions">
                    @if (anomaly.status === 'Investigating') {
                      <button
                        class="btn btn-secondary btn-sm"
                        (click)="dataService.updateAnomalyStatus(anomaly.id, 'Resolved')"
                      >
                        <app-icon name="check" [size]="12" />
                        Marcar Resolvido
                      </button>
                    } @else {
                      <span class="badge badge-success">
                        <app-icon name="check" [size]="11" />
                        {{ anomaly.status }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
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

      .live-dot {
        width: 6px;
        height: 6px;
        border-radius: var(--radius-full);
        background-color: var(--accent-primary);
        box-shadow: 0 0 8px var(--accent-primary);
        animation: pulse 2s infinite;
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

      .header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        gap: 16px;
      }

      .charts-row {
        display: grid;
        grid-template-columns: 2fr 1.2fr;
        gap: 16px;
      }

      @media (max-width: 1024px) {
        .charts-row {
          grid-template-columns: 1fr;
        }
      }

      .chart-card {
        display: flex;
        flex-direction: column;
      }

      .distribution-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .provider-bars {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin: 12px 0 20px 0;
      }

      .provider-item {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .provider-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.82rem;
      }

      .provider-name {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-primary);
        font-weight: 500;
      }

      .provider-bullet {
        width: 8px;
        height: 8px;
        border-radius: var(--radius-full);
        border: 1px solid var(--text-primary);
      }
      .bullet-aws {
        background-color: var(--text-primary);
      }
      .bullet-gcp {
        background-color: var(--text-secondary);
      }
      .bullet-azure {
        background-color: var(--text-muted);
      }
      .bullet-k8s {
        background-color: transparent;
      }

      .provider-val {
        color: var(--text-secondary);
        font-size: 0.78rem;
      }

      .progress-track {
        width: 100%;
        height: 6px;
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-full);
        overflow: hidden;
        border: 1px solid var(--border-muted);
      }

      .progress-fill {
        height: 100%;
        background-color: var(--text-primary);
        border-radius: var(--radius-full);
        transition: width 0.4s ease;
      }

      .bar-warning {
        background-color: #e4e4e7;
      }

      .bar-exceeded {
        background-color: #ffffff;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
      }

      .summary-box {
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        padding: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .summary-stat {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .summary-label {
        font-size: 0.72rem;
        color: var(--text-muted);
        text-transform: uppercase;
      }

      .summary-value {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .grid-two-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      @media (max-width: 900px) {
        .grid-two-columns {
          grid-template-columns: 1fr;
        }
      }

      .budget-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .budget-quick-item {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 10px 12px;
        border-radius: var(--radius-sm);
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-muted);
      }

      .budget-quick-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .budget-quick-name {
        font-size: 0.84rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-right: 8px;
      }

      .budget-quick-numbers {
        font-size: 0.78rem;
      }

      .spend-now {
        font-weight: 700;
        color: var(--text-primary);
      }

      .spend-limit {
        color: var(--text-muted);
      }

      .spend-pct {
        margin-left: 4px;
        font-weight: 600;
      }

      .text-warning {
        color: #facc15;
      }

      .text-danger {
        color: #f87171;
      }

      .anomaly-quick-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .anomaly-quick-item {
        padding: 12px;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-muted);
        border-radius: var(--radius-sm);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .anomaly-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .anomaly-title-area {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .anomaly-icon-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 4px;
        background-color: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      .anomaly-service {
        font-size: 0.84rem;
        color: var(--text-primary);
      }

      .anomaly-spike-badge {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 2px 6px;
        background-color: var(--accent-primary);
        color: var(--text-inverse);
        border-radius: 3px;
      }

      .anomaly-rca {
        font-size: 0.78rem;
        color: var(--text-secondary);
        line-height: 1.35;
      }

      .anomaly-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 2px;
      }

      .anomaly-date {
        font-size: 0.72rem;
        color: var(--text-muted);
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.3;
        }
      }
    `,
  ],
})
export class DashboardComponent {
  readonly dataService = inject(FinOpsDataService);
}
