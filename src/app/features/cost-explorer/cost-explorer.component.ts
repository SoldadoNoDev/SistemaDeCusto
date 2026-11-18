import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinOpsDataService } from '../../core/services/finops-data.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CloudProvider, CostExplorerItem } from '../../core/models/finops.model';

@Component({
  selector: 'app-cost-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="explorer-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="header-pre-title">
            <span>ANÁLISE MULTIDIMENSIONAL & SHOWBACK</span>
            <span class="separator">•</span>
            <span>VANTAGE & AWS COST EXPLORER ENGINE</span>
          </div>
          <h1 class="page-title">Cost Explorer Analítico</h1>
          <p class="page-subtitle">
            Detalhamento granular por serviço, região, ambiente, time responsável e análise de variação mês-a-mês.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-secondary btn-sm" (click)="exportJSON()">
            <app-icon name="download" [size]="14" />
            Exportar JSON
          </button>
          <button class="btn btn-secondary btn-sm" (click)="exportCSV()">
            <app-icon name="download" [size]="14" />
            Exportar CSV
          </button>
        </div>
      </div>

      <!-- Filter & Controls Toolbar -->
      <div class="card toolbar-card">
        <div class="filter-group-left">
          <!-- Search input -->
          <div class="search-input-wrap">
            <app-icon name="search" [size]="14" class="search-icon" />
            <input
              type="text"
              class="form-input search-input"
              placeholder="Filtrar por serviço, recurso ou time..."
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
            />
            @if (searchQuery()) {
              <button class="btn-clear" (click)="searchQuery.set('')">
                <app-icon name="x" [size]="12" />
              </button>
            }
          </div>

          <!-- Team Filter (NOVO) -->
          <div class="filter-select-wrap">
            <span class="filter-label">Time:</span>
            <select
              class="form-select filter-select font-mono"
              [ngModel]="selectedTeam()"
              (ngModelChange)="onTeamChange($event)"
            >
              <option value="All">Todos os Times</option>
              @for (team of dataService.teams(); track team.id) {
                <option [value]="team.id">{{ team.name }} ({{ team.costCenter }})</option>
              }
            </select>
          </div>

          <!-- Provider Filter -->
          <div class="filter-select-wrap">
            <span class="filter-label">Nuvem:</span>
            <select
              class="form-select filter-select"
              [ngModel]="selectedProvider()"
              (ngModelChange)="selectedProvider.set($event)"
            >
              <option value="All">Todas as Nuvens</option>
              <option value="AWS">Amazon Web Services</option>
              <option value="GCP">Google Cloud Platform</option>
              <option value="Azure">Microsoft Azure</option>
              <option value="Kubernetes">Kubernetes</option>
            </select>
          </div>

          <!-- Environment Filter -->
          <div class="filter-select-wrap">
            <span class="filter-label">Ambiente:</span>
            <select
              class="form-select filter-select"
              [ngModel]="selectedEnv()"
              (ngModelChange)="selectedEnv.set($event)"
            >
              <option value="All">Todos os Ambientes</option>
              <option value="Production">Produção (Prod)</option>
              <option value="Staging">Staging & Sandboxes</option>
            </select>
          </div>
        </div>

        <div class="filter-group-right">
          <!-- Sort Options -->
          <div class="filter-select-wrap">
            <span class="filter-label">Ordenar:</span>
            <select
              class="form-select filter-select"
              [ngModel]="sortBy()"
              (ngModelChange)="sortBy.set($event)"
            >
              <option value="cost-desc">Maior Custo ($)</option>
              <option value="cost-asc">Menor Custo ($)</option>
              <option value="trend-desc">Maior Aumento MoM (%)</option>
              <option value="name-asc">Nome do Serviço (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Cost Breakdown Summary Bar -->
      <div class="card breakdown-banner">
        <div class="banner-stat">
          <span class="stat-label">Spend Total Filtrado</span>
          <span class="stat-value font-mono">\${{ filteredTotalCost() | number: '1.2-2' }}</span>
        </div>
        <div class="banner-stat">
          <span class="stat-label">Serviços Listados</span>
          <span class="stat-value font-mono">{{ filteredItems().length }} itens</span>
        </div>
        <div class="banner-stat">
          <span class="stat-label">Variação Média Ponderada</span>
          <span class="stat-value font-mono">+{{ averageTrend() }}% MoM</span>
        </div>
        <div class="banner-stat">
          <span class="stat-label">Filtro de Time Ativo</span>
          <span class="stat-value font-mono">
            {{ activeTeamName() }}
          </span>
        </div>
      </div>

      <!-- Data Table -->
      <div class="card table-card">
        <div class="table-responsive">
          <table class="finops-table">
            <thead>
              <tr>
                <th>SERVIÇO EM NUVEM</th>
                <th>TIME RESPONSÁVEL (SHOWBACK)</th>
                <th>PROVEDOR</th>
                <th>AMBIENTE</th>
                <th>REGIÃO</th>
                <th class="text-right">VOLUME / UNIDADE</th>
                <th class="text-right">CUSTO MTD ($)</th>
                <th class="text-right">% DO TOTAL</th>
                <th class="text-right">VARIAÇÃO MoM</th>
                <th style="width: 120px;">PROPORÇÃO</th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredItems(); track item.id) {
                @let pctOfTotal = (item.cost / maxCost()) * 100;
                <tr>
                  <td class="cell-service">
                    <strong class="service-name">{{ item.service }}</strong>
                  </td>
                  <td>
                    <span class="team-tag font-mono" (click)="selectedTeam.set(item.teamId)" title="Filtrar por este time">
                      <app-icon name="users" [size]="12" />
                      {{ item.teamName }}
                    </span>
                  </td>
                  <td>
                    <span class="badge font-mono">{{ item.provider }}</span>
                  </td>
                  <td>
                    <span
                      class="env-tag font-mono"
                      [class.env-prod]="item.environment === 'Production'"
                    >
                      {{ item.environment }}
                    </span>
                  </td>
                  <td>
                    <span class="font-mono text-muted region-code">{{ item.region }}</span>
                  </td>
                  <td class="text-right font-mono text-secondary">
                    {{ item.usageQuantity | number: '1.0-0' }} {{ item.usageUnit }}
                  </td>
                  <td class="text-right font-mono font-semibold cell-cost">
                    \${{ item.cost | number: '1.2-2' }}
                  </td>
                  <td class="text-right font-mono text-muted">
                    {{ ((item.cost / filteredTotalCost()) * 100) | number: '1.1-1' }}%
                  </td>
                  <td class="text-right font-mono">
                    <span
                      class="trend-tag"
                      [class.trend-up]="item.trendPercentage > 0"
                      [class.trend-down]="item.trendPercentage < 0"
                    >
                      @if (item.trendPercentage > 0) {
                        +{{ item.trendPercentage }}%
                      } @else {
                        {{ item.trendPercentage }}%
                      }
                    </span>
                  </td>
                  <td>
                    <div class="proportion-track" title="{{ pctOfTotal | number: '1.0-0' }}% do maior serviço">
                      <div class="proportion-fill" [style.width.%]="pctOfTotal"></div>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="10" class="empty-row">
                    <div class="empty-state">
                      <app-icon name="search" [size]="24" />
                      <p>Nenhum serviço encontrado com os filtros selecionados.</p>
                      <button class="btn btn-secondary btn-sm" (click)="resetFilters()">
                        Limpar Filtros
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .explorer-page {
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
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .toolbar-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        padding: 14px 18px;
      }

      .filter-group-left {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
        flex: 1;
      }

      .filter-group-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .search-input-wrap {
        position: relative;
        display: flex;
        align-items: center;
        min-width: 220px;
        flex: 1;
        max-width: 320px;
      }

      .search-icon {
        position: absolute;
        left: 10px;
        color: var(--text-muted);
        pointer-events: none;
      }

      .search-input {
        padding-left: 32px;
        padding-right: 28px;
        font-size: 0.84rem;
        padding-top: 7px;
        padding-bottom: 7px;
      }

      .btn-clear {
        position: absolute;
        right: 8px;
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 2px;
        line-height: 0;
      }

      .filter-select-wrap {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .filter-label {
        font-size: 0.78rem;
        color: var(--text-muted);
        font-weight: 500;
      }

      .filter-select {
        width: auto;
        padding: 6px 10px;
        font-size: 0.82rem;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        color: var(--text-primary);
      }

      .breakdown-banner {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
        padding: 16px 20px;
        background-color: var(--bg-secondary);
      }

      .banner-stat {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .stat-label {
        font-size: 0.72rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .stat-value {
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .table-card {
        padding: 0;
        overflow: hidden;
      }

      .table-responsive {
        width: 100%;
        overflow-x: auto;
      }

      .finops-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.84rem;
        text-align: left;
      }

      .finops-table th {
        padding: 12px 18px;
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--text-muted);
        background-color: var(--bg-tertiary);
        border-bottom: 1px solid var(--border-subtle);
        letter-spacing: 0.05em;
        white-space: nowrap;
      }

      .finops-table td {
        padding: 14px 18px;
        border-bottom: 1px solid var(--border-muted);
        color: var(--text-primary);
        vertical-align: middle;
      }

      .finops-table tr:hover td {
        background-color: var(--bg-hover);
      }

      .cell-service {
        font-weight: 600;
      }

      .service-name {
        color: var(--text-primary);
      }

      .team-tag {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.75rem;
        color: var(--text-secondary);
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-muted);
        padding: 3px 8px;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: border-color var(--transition-fast), color var(--transition-fast);
      }
      .team-tag:hover {
        border-color: var(--border-focus);
        color: var(--text-primary);
      }

      .cell-cost {
        color: var(--text-primary);
        font-size: 0.9rem;
      }

      .env-tag {
        font-size: 0.74rem;
        padding: 2px 6px;
        border-radius: 3px;
        border: 1px solid var(--border-muted);
        color: var(--text-secondary);
      }
      .env-prod {
        border-color: var(--border-subtle);
        color: var(--text-primary);
      }

      .region-code {
        font-size: 0.78rem;
      }

      .text-right {
        text-align: right;
      }

      .font-semibold {
        font-weight: 600;
      }

      .trend-tag {
        font-size: 0.75rem;
        padding: 2px 6px;
        border-radius: 3px;
        border: 1px solid var(--border-muted);
        background-color: var(--bg-tertiary);
        color: var(--text-secondary);
      }

      .trend-up {
        border-color: #71717a;
        color: #ffffff;
      }

      .trend-down {
        border-color: #3f3f46;
        color: #a1a1aa;
      }

      .proportion-track {
        width: 100%;
        height: 5px;
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-full);
        overflow: hidden;
        border: 1px solid var(--border-muted);
      }

      .proportion-fill {
        height: 100%;
        background-color: var(--text-primary);
        border-radius: var(--radius-full);
      }

      .empty-row {
        padding: 48px 18px;
        text-align: center;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: var(--text-muted);
      }
    `,
  ],
})
export class CostExplorerComponent {
  readonly dataService = inject(FinOpsDataService);

  readonly searchQuery = signal<string>('');
  readonly selectedTeam = signal<string>('All');
  readonly selectedProvider = signal<string>('All');
  readonly selectedEnv = signal<string>('All');
  readonly sortBy = signal<string>('cost-desc');

  constructor() {
    // Sync with global team filter if set
    effect(() => {
      const global = this.dataService.selectedGlobalTeam();
      if (global) {
        this.selectedTeam.set(global);
      }
    });
  }

  onTeamChange(teamId: string): void {
    this.selectedTeam.set(teamId);
  }

  readonly activeTeamName = computed(() => {
    const id = this.selectedTeam();
    if (id === 'All') return 'Todos os Times (Global)';
    const team = this.dataService.teams().find((t) => t.id === id);
    return team ? team.name : id;
  });

  readonly filteredItems = computed(() => {
    let list = this.dataService.costExplorerItems();

    // Query filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(
        (item) =>
          item.service.toLowerCase().includes(query) ||
          item.region.toLowerCase().includes(query) ||
          item.provider.toLowerCase().includes(query) ||
          (item.teamName && item.teamName.toLowerCase().includes(query))
      );
    }

    // Team filter
    if (this.selectedTeam() !== 'All') {
      list = list.filter((item) => item.teamId === this.selectedTeam());
    }

    // Provider filter
    if (this.selectedProvider() !== 'All') {
      list = list.filter((item) => item.provider === this.selectedProvider());
    }

    // Env filter
    if (this.selectedEnv() !== 'All') {
      list = list.filter((item) => item.environment === this.selectedEnv());
    }

    // Sort
    const sort = this.sortBy();
    return [...list].sort((a, b) => {
      if (sort === 'cost-desc') return b.cost - a.cost;
      if (sort === 'cost-asc') return a.cost - b.cost;
      if (sort === 'trend-desc') return b.trendPercentage - a.trendPercentage;
      if (sort === 'name-asc') return a.service.localeCompare(b.service);
      return 0;
    });
  });

  readonly filteredTotalCost = computed(() => {
    return this.filteredItems().reduce((acc, item) => acc + item.cost, 0);
  });

  readonly maxCost = computed(() => {
    const list = this.filteredItems();
    if (list.length === 0) return 1;
    return Math.max(...list.map((item) => item.cost));
  });

  readonly averageTrend = computed(() => {
    const list = this.filteredItems();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, item) => acc + item.trendPercentage, 0);
    return Number((sum / list.length).toFixed(1));
  });

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedTeam.set('All');
    this.selectedProvider.set('All');
    this.selectedEnv.set('All');
    this.sortBy.set('cost-desc');
  }

  exportCSV(): void {
    const items = this.filteredItems();
    const headers = 'ID,Servico,Time_Responsavel,Provedor,Ambiente,Regiao,Custo_MTD,Unidade,Quantidade,Variacao_MoM\n';
    const rows = items
      .map(
        (i) =>
          `"${i.id}","${i.service}","${i.teamName}","${i.provider}","${i.environment}","${i.region}",${i.cost},"${i.usageUnit}",${i.usageQuantity},${i.trendPercentage}%`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `zenith-finops-teams-costs-${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    this.dataService.showToast('Exportação Concluída', 'Relatório CSV gerado e baixado com sucesso.');
  }

  exportJSON(): void {
    const dataStr = JSON.stringify(this.filteredItems(), null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `zenith-finops-teams-costs-${new Date().toISOString().slice(0, 10)}.json`);
    link.click();
    this.dataService.showToast('Exportação Concluída', 'Arquivo JSON de custos exportado.');
  }
}
