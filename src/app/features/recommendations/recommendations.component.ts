import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinOpsDataService } from '../../core/services/finops-data.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import {
  SavingsRecommendation,
  RecommendationCategory,
  CloudProvider,
} from '../../core/models/finops.model';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="recommendations-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="header-pre-title">
            <span>INTELIGÊNCIA DE REDUÇÃO DE DESPERDÍCIOS</span>
            <span class="separator">•</span>
            <span>MÓDULO CRUD 2</span>
          </div>
          <h1 class="page-title">Otimizações & Recomendações de Economia</h1>
          <p class="page-subtitle">
            Identifique recursos ociosos, superdimensionados (rightsizing) e oportunidades de compromisso financeiro para mitigar desperdício de nuvem.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-primary" (click)="openCreateModal()">
            <app-icon name="plus" [size]="15" />
            Nova Recomendação
          </button>
        </div>
      </div>

      <!-- Financial Impact Banner -->
      <div class="card savings-hero-card">
        <div class="savings-metric">
          <span class="hero-label">Economia Mensal em Aberto</span>
          <span class="hero-val font-mono">
            \${{ dataService.totalSavingsPotential() | number: '1.0-0' }}<span class="per-mo">/mês</span>
          </span>
          <span class="hero-subtext">Disponível para captura imediata</span>
        </div>

        <div class="savings-separator"></div>

        <div class="savings-metric">
          <span class="hero-label">Economia Anualizada Potencial</span>
          <span class="hero-val font-mono">
            \${{ (dataService.totalSavingsPotential() * 12) | number: '1.0-0' }}<span class="per-mo">/ano</span>
          </span>
          <span class="hero-subtext">Impacto direto no EBITDA</span>
        </div>

        <div class="savings-separator"></div>

        <div class="savings-metric">
          <span class="hero-label">Economia Consolidada Realizada</span>
          <span class="hero-val font-mono text-success">
            \${{ dataService.realizedSavings() | number: '1.0-0' }}<span class="per-mo">/mês</span>
          </span>
          <span class="hero-subtext">Ações validadas pelo time FinOps</span>
        </div>
      </div>

      <!-- Filters & Category Navigation -->
      <div class="card toolbar-card">
        <div class="search-input-wrap">
          <app-icon name="search" [size]="14" class="search-icon" />
          <input
            type="text"
            class="form-input search-input"
            placeholder="Pesquisar por título, serviço ou ID do recurso..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
          />
          @if (searchQuery()) {
            <button class="btn-clear" (click)="searchQuery.set('')">
              <app-icon name="x" [size]="12" />
            </button>
          }
        </div>

        <div class="status-filters">
          <button
            class="filter-pill"
            [class.active]="selectedCategory() === 'All'"
            (click)="selectedCategory.set('All')"
          >
            Todas as Categorias
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedCategory() === 'Rightsizing'"
            (click)="selectedCategory.set('Rightsizing')"
          >
            Rightsizing
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedCategory() === 'Idle Resource'"
            (click)="selectedCategory.set('Idle Resource')"
          >
            Recurso Ocioso
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedCategory() === 'Reserved Instance'"
            (click)="selectedCategory.set('Reserved Instance')"
          >
            Savings Plans
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedCategory() === 'Storage Optimization'"
            (click)="selectedCategory.set('Storage Optimization')"
          >
            Storage
          </button>
        </div>
      </div>

      <!-- Recommendations Cards List -->
      <div class="recommendations-list">
        @for (item of filteredRecommendations(); track item.id) {
          @let isApplied = item.status === 'Applied';

          <div class="card recommendation-card" [class.card-applied]="isApplied">
            <div class="rec-main">
              <!-- Top Metadata -->
              <div class="rec-top-meta">
                <div class="meta-badges">
                  <span class="badge font-mono">{{ item.provider }}</span>
                  <span class="badge badge-outline font-mono">{{ item.category }}</span>
                  <span class="meta-service font-mono">{{ item.service }}</span>

                  @if (isApplied) {
                    <span class="badge badge-solid font-mono">
                      <app-icon name="check" [size]="11" />
                      APLICADO
                    </span>
                  } @else if (item.status === 'In Review') {
                    <span class="badge badge-warning font-mono">EM REVISÃO</span>
                  }
                </div>

                <div class="rec-actions">
                  <button
                    class="btn btn-ghost btn-icon"
                    title="Editar Oportunidade"
                    (click)="openEditModal(item)"
                  >
                    <app-icon name="edit" [size]="14" />
                  </button>
                  <button
                    class="btn btn-danger btn-icon"
                    title="Descartar Recomendação"
                    (click)="deleteItem(item.id)"
                  >
                    <app-icon name="trash" [size]="14" />
                  </button>
                </div>
              </div>

              <!-- Title & Technical Description -->
              <h3 class="rec-title">{{ item.title }}</h3>
              <p class="rec-desc">{{ item.description }}</p>

              <!-- Resource ID & Risk/Effort Badges -->
              <div class="rec-specs">
                <div class="resource-id font-mono">
                  <span class="spec-label">Recurso:</span>
                  <code>{{ item.resourceId }}</code>
                </div>

                <div class="spec-badges">
                  <span class="spec-pill" title="Nível de risco operacional">
                    Risco: <strong>{{ item.risk }}</strong>
                  </span>
                  <span class="spec-pill" title="Complexidade de esforço">
                    Esforço: <strong>{{ item.effort }}</strong>
                  </span>
                </div>
              </div>
            </div>

            <!-- Financial Callout & Action Box -->
            <div class="rec-financial-box">
              <div class="financial-numbers">
                <div class="cost-before-after font-mono">
                  <span class="cost-prev">\${{ item.currentCostMonthly | number: '1.0-0' }}/mês</span>
                  <span class="cost-arrow">→</span>
                  <span class="cost-next">\${{ item.projectedCostMonthly | number: '1.0-0' }}/mês</span>
                </div>
                <div class="savings-highlight">
                  <span class="savings-amount font-mono">
                    +\${{ item.estimatedSavingsMonthly | number: '1.0-0' }}
                  </span>
                  <span class="savings-unit">/mês de economia</span>
                </div>
              </div>

              <div class="action-wrap">
                @if (!isApplied) {
                  <button class="btn btn-primary btn-apply" (click)="dataService.applyRecommendation(item.id)">
                    <app-icon name="check" [size]="14" />
                    Aplicar Otimização
                  </button>
                } @else {
                  <div class="applied-timestamp font-mono">
                    <span>✓ Otimizado</span>
                  </div>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state-full card">
            <app-icon name="sparkles" [size]="32" />
            <h3>Nenhuma recomendação encontrada</h3>
            <p>Nenhuma oportunidade corresponde aos filtros atuais.</p>
            <button class="btn btn-primary btn-sm" (click)="openCreateModal()">
              Criar Nova Recomendação
            </button>
          </div>
        }
      </div>

      <!-- CREATE / EDIT MODAL -->
      <app-modal
        [isOpen]="isFormModalOpen()"
        [title]="editingRec() ? 'Editar Oportunidade de Otimização' : 'Nova Oportunidade de Economia'"
        [subtitle]="'Cadastre uma nova análise técnica de rightsizing ou reserva.'"
        maxWidth="560px"
        (close)="closeFormModal()"
      >
        <form (ngSubmit)="saveRecommendation()" class="rec-form">
          <div class="form-group">
            <label class="form-label">Título da Otimização *</label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="formData.title"
              name="title"
              placeholder="ex: Downsizing de banco de dados Postgres secundário"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Provedor *</label>
              <select class="form-select" [(ngModel)]="formData.provider" name="provider">
                <option value="AWS">Amazon Web Services</option>
                <option value="GCP">Google Cloud Platform</option>
                <option value="Azure">Microsoft Azure</option>
                <option value="Kubernetes">Kubernetes</option>
              </select>
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Categoria *</label>
              <select class="form-select" [(ngModel)]="formData.category" name="category">
                <option value="Rightsizing">Rightsizing (Redução de Tamanho)</option>
                <option value="Idle Resource">Recurso Ocioso (Idle)</option>
                <option value="Reserved Instance">Savings Plans / Reserva</option>
                <option value="Storage Optimization">Otimização de Storage</option>
                <option value="Architectural">Modernização Arquitetural</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Serviço Afetado *</label>
              <input
                type="text"
                class="form-input"
                [(ngModel)]="formData.service"
                name="service"
                placeholder="ex: Amazon EC2"
                required
              />
            </div>

            <div class="form-group flex-1">
              <label class="form-label">ID do Recurso / ARN *</label>
              <input
                type="text"
                class="form-input font-mono"
                [(ngModel)]="formData.resourceId"
                name="resourceId"
                placeholder="ex: i-0a819b2848c1"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Custo Atual Mensal ($) *</label>
              <input
                type="number"
                class="form-input font-mono"
                [(ngModel)]="formData.currentCostMonthly"
                name="currentCostMonthly"
                min="0"
                step="10"
                placeholder="ex: 1800"
                required
              />
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Custo Projetado Mensal ($) *</label>
              <input
                type="number"
                class="form-input font-mono"
                [(ngModel)]="formData.projectedCostMonthly"
                name="projectedCostMonthly"
                min="0"
                step="10"
                placeholder="ex: 600"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Nível de Risco</label>
              <select class="form-select" [(ngModel)]="formData.risk" name="risk">
                <option value="Low">Baixo (Zero Downtime)</option>
                <option value="Medium">Médio (Janela de Manutenção)</option>
                <option value="High">Alto (Impacto Potencial)</option>
              </select>
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Esforço de Execução</label>
              <select class="form-select" [(ngModel)]="formData.effort" name="effort">
                <option value="Low">Baixo (< 1 hora)</option>
                <option value="Medium">Médio (1 a 4 horas)</option>
                <option value="High">Alto (Sprint planejada)</option>
              </select>
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Status</label>
              <select class="form-select" [(ngModel)]="formData.status" name="status">
                <option value="Open">Em Aberto</option>
                <option value="In Review">Em Revisão</option>
                <option value="Applied">Aplicado</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Justificativa & Diagnóstico Técnico *</label>
            <textarea
              class="form-textarea"
              rows="3"
              [(ngModel)]="formData.description"
              name="description"
              placeholder="Detalhe o diagnóstico de métricas (CloudWatch / Prometheus) que comprova a ociosidade..."
              required
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeFormModal()">
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="!formData.title || !formData.service || formData.currentCostMonthly <= 0"
            >
              {{ editingRec() ? 'Salvar Oportunidade' : 'Cadastrar Recomendação' }}
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
  styles: [
    `
      .recommendations-page {
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

      .savings-hero-card {
        display: grid;
        grid-template-columns: 1fr auto 1fr auto 1fr;
        align-items: center;
        padding: 22px 28px;
        gap: 20px;
        background-color: var(--bg-secondary);
      }

      @media (max-width: 850px) {
        .savings-hero-card {
          grid-template-columns: 1fr;
        }
        .savings-separator {
          display: none;
        }
      }

      .savings-separator {
        width: 1px;
        height: 50px;
        background-color: var(--border-subtle);
      }

      .savings-metric {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .hero-label {
        font-size: 0.72rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 500;
      }

      .hero-val {
        font-size: 1.8rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: var(--text-primary);
      }

      .per-mo {
        font-size: 0.9rem;
        color: var(--text-muted);
        font-weight: 400;
      }

      .text-success {
        color: #ffffff;
      }

      .hero-subtext {
        font-size: 0.78rem;
        color: var(--text-secondary);
      }

      .toolbar-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
        padding: 12px 18px;
      }

      .search-input-wrap {
        position: relative;
        display: flex;
        align-items: center;
        min-width: 260px;
        flex: 1;
        max-width: 400px;
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

      .status-filters {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .filter-pill {
        padding: 6px 12px;
        border-radius: var(--radius-full);
        font-size: 0.78rem;
        font-weight: 500;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .filter-pill:hover {
        border-color: var(--border-focus);
        color: var(--text-primary);
      }

      .filter-pill.active {
        background-color: var(--accent-primary);
        color: var(--text-inverse);
        border-color: var(--accent-primary);
      }

      .recommendations-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .recommendation-card {
        display: grid;
        grid-template-columns: 1fr 240px;
        gap: 20px;
        padding: 20px;
        transition: border-color var(--transition-fast);
      }

      @media (max-width: 880px) {
        .recommendation-card {
          grid-template-columns: 1fr;
        }
      }

      .card-applied {
        border-color: var(--border-muted);
        background-color: rgba(255, 255, 255, 0.02);
      }

      .rec-main {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .rec-top-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .meta-badges {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .meta-service {
        font-size: 0.76rem;
        color: var(--text-muted);
      }

      .rec-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .rec-title {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--text-primary);
        letter-spacing: -0.01em;
      }

      .rec-desc {
        font-size: 0.84rem;
        color: var(--text-secondary);
        line-height: 1.45;
      }

      .rec-specs {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        padding-top: 6px;
        border-top: 1px solid var(--border-muted);
      }

      .resource-id {
        font-size: 0.76rem;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .resource-id code {
        background-color: var(--bg-tertiary);
        padding: 2px 6px;
        border-radius: 3px;
        border: 1px solid var(--border-muted);
        color: var(--text-primary);
      }

      .spec-badges {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .spec-pill {
        font-size: 0.72rem;
        color: var(--text-muted);
      }
      .spec-pill strong {
        color: var(--text-primary);
      }

      .rec-financial-box {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 16px;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-muted);
        border-radius: var(--radius-sm);
        text-align: right;
      }

      .financial-numbers {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .cost-before-after {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        font-size: 0.78rem;
      }

      .cost-prev {
        color: var(--text-muted);
        text-decoration: line-through;
      }
      .cost-arrow {
        color: var(--text-muted);
      }
      .cost-next {
        color: var(--text-primary);
        font-weight: 600;
      }

      .savings-highlight {
        display: flex;
        flex-direction: column;
      }

      .savings-amount {
        font-size: 1.45rem;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }

      .savings-unit {
        font-size: 0.72rem;
        color: var(--text-muted);
      }

      .action-wrap {
        margin-top: 14px;
      }

      .btn-apply {
        width: 100%;
      }

      .applied-timestamp {
        font-size: 0.78rem;
        color: var(--text-muted);
        text-align: center;
      }

      .form-row {
        display: flex;
        gap: 12px;
      }

      .flex-1 {
        flex: 1;
      }

      .modal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 16px;
      }

      .empty-state-full {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 60px 20px;
        color: var(--text-muted);
        text-align: center;
      }
    `,
  ],
})
export class RecommendationsComponent {
  readonly dataService = inject(FinOpsDataService);

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('All');

  readonly isFormModalOpen = signal<boolean>(false);
  readonly editingRec = signal<SavingsRecommendation | null>(null);

  formData: {
    title: string;
    service: string;
    provider: CloudProvider;
    category: RecommendationCategory;
    currentCostMonthly: number;
    projectedCostMonthly: number;
    effort: 'Low' | 'Medium' | 'High';
    risk: 'Low' | 'Medium' | 'High';
    status: 'Open' | 'In Review' | 'Applied';
    description: string;
    resourceId: string;
  } = {
    title: '',
    service: '',
    provider: 'AWS',
    category: 'Rightsizing',
    currentCostMonthly: 1200,
    projectedCostMonthly: 400,
    effort: 'Low',
    risk: 'Low',
    status: 'Open',
    description: '',
    resourceId: '',
  };

  readonly filteredRecommendations = computed(() => {
    let list = this.dataService.recommendations();
    const query = this.searchQuery().toLowerCase().trim();

    if (query) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.service.toLowerCase().includes(query) ||
          r.resourceId.toLowerCase().includes(query) ||
          r.provider.toLowerCase().includes(query)
      );
    }

    if (this.selectedCategory() !== 'All') {
      list = list.filter((r) => r.category === this.selectedCategory());
    }

    return list;
  });

  openCreateModal(): void {
    this.editingRec.set(null);
    this.formData = {
      title: '',
      service: '',
      provider: 'AWS',
      category: 'Rightsizing',
      currentCostMonthly: 1500,
      projectedCostMonthly: 600,
      effort: 'Low',
      risk: 'Low',
      status: 'Open',
      description: '',
      resourceId: '',
    };
    this.isFormModalOpen.set(true);
  }

  openEditModal(item: SavingsRecommendation): void {
    this.editingRec.set(item);
    this.formData = {
      title: item.title,
      service: item.service,
      provider: item.provider,
      category: item.category,
      currentCostMonthly: item.currentCostMonthly,
      projectedCostMonthly: item.projectedCostMonthly,
      effort: item.effort,
      risk: item.risk,
      status: item.status === 'Dismissed' ? 'Open' : item.status,
      description: item.description,
      resourceId: item.resourceId,
    };
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
    this.editingRec.set(null);
  }

  saveRecommendation(): void {
    const estimatedSavingsMonthly = Math.max(
      0,
      this.formData.currentCostMonthly - this.formData.projectedCostMonthly
    );

    const target = this.editingRec();
    if (target) {
      this.dataService.updateRecommendation(target.id, {
        ...this.formData,
        estimatedSavingsMonthly,
      });
    } else {
      this.dataService.createRecommendation({
        ...this.formData,
        estimatedSavingsMonthly,
      });
    }
    this.closeFormModal();
  }

  deleteItem(id: string): void {
    this.dataService.deleteRecommendation(id);
  }
}
