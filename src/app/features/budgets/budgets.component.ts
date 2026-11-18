import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinOpsDataService } from '../../core/services/finops-data.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Budget, CloudProvider } from '../../core/models/finops.model';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="budgets-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="header-pre-title">
            <span>GOVERNANÇA & CONTROLE DE GASTOS</span>
            <span class="separator">•</span>
            <span>MÓDULO CRUD 1</span>
          </div>
          <h1 class="page-title">Gestão de Orçamentos & Limiares</h1>
          <p class="page-subtitle">
            Defina limites orçamentários por nuvem ou departamento, configure canais de alerta e acompanhe a taxa de queima (burn rate).
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-primary" (click)="openCreateModal()">
            <app-icon name="plus" [size]="15" />
            Criar Novo Orçamento
          </button>
        </div>
      </div>

      <!-- Filters & Stats Row -->
      <div class="card toolbar-card">
        <div class="search-input-wrap">
          <app-icon name="search" [size]="14" class="search-icon" />
          <input
            type="text"
            class="form-input search-input"
            placeholder="Pesquisar orçamento por nome ou tag..."
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
            [class.active]="selectedStatus() === 'All'"
            (click)="selectedStatus.set('All')"
          >
            Todos ({{ dataService.budgets().length }})
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedStatus() === 'Normal'"
            (click)="selectedStatus.set('Normal')"
          >
            Normais (<80%)
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedStatus() === 'Warning'"
            (click)="selectedStatus.set('Warning')"
          >
            Em Alerta (80%-99%)
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedStatus() === 'Exceeded'"
            (click)="selectedStatus.set('Exceeded')"
          >
            Excedidos (≥100%)
          </button>
        </div>
      </div>

      <!-- Budgets Grid -->
      <div class="budgets-grid">
        @for (budget of filteredBudgets(); track budget.id) {
          @let pct = (budget.currentSpend / budget.amount) * 100;
          @let isExceeded = pct >= 100;
          @let isWarning = pct >= budget.alertThresholdPercent && pct < 100;
          @let remaining = budget.amount - budget.currentSpend;

          <div class="card budget-card" [class.border-critical]="isExceeded" [class.border-warning]="isWarning">
            <div class="budget-card-header">
              <div class="budget-title-area">
                <span class="badge font-mono">{{ budget.provider }}</span>
                <span class="badge badge-outline font-mono">{{ budget.period }}</span>
                @if (isExceeded) {
                  <span class="badge badge-critical font-mono">ESTOURADO</span>
                } @else if (isWarning) {
                  <span class="badge badge-warning font-mono">LIMIAR {{ budget.alertThresholdPercent }}%</span>
                } @else {
                  <span class="badge font-mono">SAUDÁVEL</span>
                }
              </div>

              <div class="budget-actions">
                <button
                  class="btn btn-ghost btn-icon"
                  title="Editar Orçamento"
                  (click)="openEditModal(budget)"
                >
                  <app-icon name="edit" [size]="14" />
                </button>
                <button
                  class="btn btn-danger btn-icon"
                  title="Excluir Orçamento"
                  (click)="openDeleteModal(budget)"
                >
                  <app-icon name="trash" [size]="14" />
                </button>
              </div>
            </div>

            <h3 class="budget-name">{{ budget.name }}</h3>
            @if (budget.description) {
              <p class="budget-desc">{{ budget.description }}</p>
            }

            <div class="budget-numbers">
              <div class="number-block">
                <span class="num-label">Gasto Atual (MTD)</span>
                <span class="num-value font-mono">\${{ budget.currentSpend | number: '1.2-2' }}</span>
              </div>
              <div class="number-block text-right">
                <span class="num-label">Teto Orçado</span>
                <span class="num-value font-mono font-muted">\${{ budget.amount | number: '1.2-2' }}</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="progress-wrap">
              <div class="progress-info">
                <span class="burn-rate font-mono">
                  Burn Rate: <strong>{{ pct | number: '1.1-1' }}%</strong>
                </span>
                <span class="remaining-balance font-mono">
                  @if (remaining >= 0) {
                    Resta: \${{ remaining | number: '1.0-0' }}
                  } @else {
                    Excedeu: \${{ -remaining | number: '1.0-0' }}
                  }
                </span>
              </div>

              <div class="progress-track">
                <div
                  class="progress-fill"
                  [class.bar-exceeded]="isExceeded"
                  [class.bar-warning]="isWarning"
                  [style.width.%]="pct > 100 ? 100 : pct"
                ></div>
              </div>
            </div>

            <!-- Card Footer Metadata -->
            <div class="budget-card-footer">
              <div class="channels font-mono">
                @if (budget.notificationEmail) {
                  <span class="channel-pill" title="Email de alerta">
                    ✉ {{ budget.notificationEmail }}
                  </span>
                }
                @if (budget.notificationSlackChannel) {
                  <span class="channel-pill" title="Canal Slack">
                    # {{ budget.notificationSlackChannel }}
                  </span>
                }
              </div>

              @if (budget.tags && budget.tags.length > 0) {
                <div class="tag-list">
                  @for (tag of budget.tags; track tag) {
                    <span class="tag-item">{{ tag }}</span>
                  }
                </div>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state-full card">
            <app-icon name="wallet" [size]="32" />
            <h3>Nenhum orçamento encontrado</h3>
            <p>Tente ajustar os termos de busca ou crie um novo teto orçamentário.</p>
            <button class="btn btn-primary btn-sm" (click)="openCreateModal()">
              Criar Novo Orçamento
            </button>
          </div>
        }
      </div>

      <!-- CREATE / EDIT MODAL -->
      <app-modal
        [isOpen]="isFormModalOpen()"
        [title]="editingBudget() ? 'Editar Orçamento de Infraestrutura' : 'Criar Novo Orçamento'"
        [subtitle]="'Configure o teto monetário e gatilhos automatizados de notificação.'"
        (close)="closeFormModal()"
      >
        <form (ngSubmit)="saveBudget()" class="budget-form">
          <div class="form-group">
            <label class="form-label">Nome do Orçamento *</label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="formData.name"
              name="name"
              placeholder="ex: AWS Core Production Database Fleet"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Provedor / Escopo *</label>
              <select class="form-select" [(ngModel)]="formData.provider" name="provider">
                <option value="All">Todas as Nuvens (Global)</option>
                <option value="AWS">Amazon Web Services</option>
                <option value="GCP">Google Cloud Platform</option>
                <option value="Azure">Microsoft Azure</option>
                <option value="Kubernetes">Kubernetes</option>
              </select>
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Periodicidade</label>
              <select class="form-select" [(ngModel)]="formData.period" name="period">
                <option value="Monthly">Mensal (Renova dia 1º)</option>
                <option value="Quarterly">Trimestral</option>
                <option value="Annual">Anual</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Teto Limite ($ USD) *</label>
              <input
                type="number"
                class="form-input font-mono"
                [(ngModel)]="formData.amount"
                name="amount"
                min="100"
                step="100"
                placeholder="ex: 25000"
                required
              />
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Limiar de Alarme (%) *</label>
              <input
                type="number"
                class="form-input font-mono"
                [(ngModel)]="formData.alertThresholdPercent"
                name="alertThresholdPercent"
                min="10"
                max="150"
                placeholder="ex: 80"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">E-mail para Alertas</label>
              <input
                type="email"
                class="form-input"
                [(ngModel)]="formData.notificationEmail"
                name="notificationEmail"
                placeholder="finops@empresa.com"
              />
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Canal do Slack</label>
              <input
                type="text"
                class="form-input"
                [(ngModel)]="formData.notificationSlackChannel"
                name="notificationSlackChannel"
                placeholder="#alertas-custos-cloud"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Tags de Governança (separadas por vírgula)</label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="tagString"
              name="tagString"
              placeholder="ex: Production, Database, Squad-Checkout"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Descrição / Finalidade</label>
            <textarea
              class="form-textarea"
              rows="2"
              [(ngModel)]="formData.description"
              name="description"
              placeholder="Descreva a finalidade deste orçamento para a equipe..."
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeFormModal()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="!formData.name || !formData.amount">
              {{ editingBudget() ? 'Salvar Alterações' : 'Criar Orçamento' }}
            </button>
          </div>
        </form>
      </app-modal>

      <!-- DELETE CONFIRMATION MODAL -->
      <app-modal
        [isOpen]="isDeleteModalOpen()"
        title="Excluir Orçamento"
        subtitle="Esta ação removerá o monitoramento deste teto orçamentário."
        maxWidth="440px"
        (close)="isDeleteModalOpen.set(false)"
      >
        <div class="delete-content">
          <p>
            Tem certeza que deseja excluir o orçamento
            <strong>"{{ budgetToDelete()?.name }}"</strong>?
          </p>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="isDeleteModalOpen.set(false)">
              Cancelar
            </button>
            <button type="button" class="btn btn-danger" (click)="confirmDelete()">
              Confirmar Exclusão
            </button>
          </div>
        </div>
      </app-modal>
    </div>
  `,
  styles: [
    `
      .budgets-page {
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
        min-width: 240px;
        flex: 1;
        max-width: 360px;
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

      .budgets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
        gap: 16px;
      }

      .budget-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 14px;
        padding: 18px;
        transition: border-color var(--transition-fast);
      }

      .border-warning {
        border-color: #71717a;
      }

      .border-critical {
        border-color: #ffffff;
      }

      .budget-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .budget-title-area {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .budget-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .budget-name {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--text-primary);
        line-height: 1.3;
      }

      .budget-desc {
        font-size: 0.8rem;
        color: var(--text-secondary);
        line-height: 1.4;
      }

      .budget-numbers {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-muted);
        border-radius: var(--radius-sm);
      }

      .number-block {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .num-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .num-value {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .font-muted {
        color: var(--text-secondary);
      }

      .progress-wrap {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .progress-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.76rem;
      }

      .burn-rate {
        color: var(--text-primary);
      }

      .remaining-balance {
        color: var(--text-muted);
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
        transition: width 0.3s ease;
      }

      .bar-warning {
        background-color: #d4d4d8;
      }

      .bar-exceeded {
        background-color: #ffffff;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
      }

      .budget-card-footer {
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-top: 1px solid var(--border-muted);
        padding-top: 10px;
      }

      .channels {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.72rem;
        color: var(--text-muted);
        flex-wrap: wrap;
      }

      .channel-pill {
        padding: 2px 6px;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-muted);
        border-radius: 4px;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tag-list {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .tag-item {
        font-size: 0.7rem;
        color: var(--text-muted);
        border: 1px dashed var(--border-subtle);
        padding: 1px 6px;
        border-radius: 3px;
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

      .delete-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        font-size: 0.9rem;
        color: var(--text-secondary);
      }

      .empty-state-full {
        grid-column: 1 / -1;
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
export class BudgetsComponent {
  readonly dataService = inject(FinOpsDataService);

  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<'All' | 'Normal' | 'Warning' | 'Exceeded'>('All');

  readonly isFormModalOpen = signal<boolean>(false);
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly editingBudget = signal<Budget | null>(null);
  readonly budgetToDelete = signal<Budget | null>(null);

  tagString = '';
  formData: {
    name: string;
    provider: CloudProvider | 'All';
    amount: number;
    period: 'Monthly' | 'Quarterly' | 'Annual';
    alertThresholdPercent: number;
    notificationEmail: string;
    notificationSlackChannel: string;
    description: string;
  } = {
    name: '',
    provider: 'All',
    amount: 10000,
    period: 'Monthly',
    alertThresholdPercent: 80,
    notificationEmail: '',
    notificationSlackChannel: '',
    description: '',
  };

  readonly filteredBudgets = computed(() => {
    let list = this.dataService.budgets();
    const query = this.searchQuery().toLowerCase().trim();

    if (query) {
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.tags.some((t) => t.toLowerCase().includes(query)) ||
          b.provider.toLowerCase().includes(query)
      );
    }

    const status = this.selectedStatus();
    if (status !== 'All') {
      list = list.filter((b) => {
        const pct = (b.currentSpend / b.amount) * 100;
        if (status === 'Exceeded') return pct >= 100;
        if (status === 'Warning') return pct >= b.alertThresholdPercent && pct < 100;
        if (status === 'Normal') return pct < b.alertThresholdPercent;
        return true;
      });
    }

    return list;
  });

  openCreateModal(): void {
    this.editingBudget.set(null);
    this.tagString = '';
    this.formData = {
      name: '',
      provider: 'All',
      amount: 15000,
      period: 'Monthly',
      alertThresholdPercent: 80,
      notificationEmail: 'finops@enterprise.io',
      notificationSlackChannel: '#alerts-costs',
      description: '',
    };
    this.isFormModalOpen.set(true);
  }

  openEditModal(budget: Budget): void {
    this.editingBudget.set(budget);
    this.tagString = (budget.tags || []).join(', ');
    this.formData = {
      name: budget.name,
      provider: budget.provider,
      amount: budget.amount,
      period: budget.period,
      alertThresholdPercent: budget.alertThresholdPercent,
      notificationEmail: budget.notificationEmail,
      notificationSlackChannel: budget.notificationSlackChannel,
      description: budget.description || '',
    };
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
    this.editingBudget.set(null);
  }

  saveBudget(): void {
    const tags = this.tagString
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const target = this.editingBudget();
    if (target) {
      this.dataService.updateBudget(target.id, {
        ...this.formData,
        tags,
      });
    } else {
      this.dataService.createBudget({
        ...this.formData,
        currentSpend: Math.round(this.formData.amount * 0.45), // Initial simulated spend baseline
        tags,
      });
    }
    this.closeFormModal();
  }

  openDeleteModal(budget: Budget): void {
    this.budgetToDelete.set(budget);
    this.isDeleteModalOpen.set(true);
  }

  confirmDelete(): void {
    const item = this.budgetToDelete();
    if (item) {
      this.dataService.deleteBudget(item.id);
    }
    this.isDeleteModalOpen.set(false);
    this.budgetToDelete.set(null);
  }
}
