import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinOpsDataService } from '../../core/services/finops-data.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { CloudAccount, CloudProvider, Environment } from '../../core/models/finops.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="accounts-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="header-pre-title">
            <span>CONECTORES DE TELEMETRIA & INGESTÃO</span>
            <span class="separator">•</span>
            <span>MÓDULO CRUD 3</span>
          </div>
          <h1 class="page-title">Contas de Nuvem & Clusters Conectados</h1>
          <p class="page-subtitle">
            Gerencie as credenciais IAM, Service Accounts e Kubeconfigs com privilégios de leitura (Read-Only) para coleta automatizada de custos.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-primary" (click)="openCreateModal()">
            <app-icon name="plus" [size]="15" />
            Conectar Nova Conta
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="card stats-banner">
        <div class="stat-cell">
          <span class="stat-label">Contas Conectadas</span>
          <span class="stat-num font-mono">{{ dataService.accounts().length }} ativas</span>
        </div>
        <div class="stat-cell">
          <span class="stat-label">Status dos Coletores</span>
          <span class="stat-num font-mono">100% Operacional</span>
        </div>
        <div class="stat-cell">
          <span class="stat-label">Último Ciclo de Sync</span>
          <span class="stat-num font-mono">Há 8 minutos</span>
        </div>
        <div class="stat-cell">
          <span class="stat-label">Spend Total Coletado</span>
          <span class="stat-num font-mono">\${{ dataService.totalSpendMTD() | number: '1.2-2' }}</span>
        </div>
      </div>

      <!-- Accounts Grid -->
      <div class="accounts-grid">
        @for (acc of dataService.accounts(); track acc.id) {
          @let isSyncing = acc.syncStatus === 'Syncing';

          <div class="card account-card">
            <div class="acc-top">
              <div class="acc-badge-area">
                <span class="badge font-mono">{{ acc.provider }}</span>
                <span class="badge badge-outline font-mono">{{ acc.environment }}</span>
                <span
                  class="badge font-mono"
                  [class.badge-success]="acc.syncStatus === 'Synced'"
                  [class.badge-warning]="isSyncing"
                >
                  <span class="dot-indicator" [class.dot-spinning]="isSyncing"></span>
                  {{ isSyncing ? 'SINCRONIZANDO...' : 'CONECTADO' }}
                </span>
              </div>

              <div class="acc-actions">
                <button
                  class="btn btn-ghost btn-icon"
                  [disabled]="isSyncing"
                  title="Sincronizar Dados Agora"
                  (click)="dataService.syncAccount(acc.id)"
                >
                  <app-icon name="refresh" [size]="14" [class.spinning]="isSyncing" />
                </button>
                <button
                  class="btn btn-ghost btn-icon"
                  title="Editar Configurações"
                  (click)="openEditModal(acc)"
                >
                  <app-icon name="edit" [size]="14" />
                </button>
                <button
                  class="btn btn-danger btn-icon"
                  title="Desconectar Conta"
                  (click)="openDeleteModal(acc)"
                >
                  <app-icon name="trash" [size]="14" />
                </button>
              </div>
            </div>

            <div class="acc-body">
              <h3 class="acc-name">{{ acc.name }}</h3>

              <div class="acc-details-list font-mono">
                <div class="detail-row">
                  <span class="detail-label">ID / Conta:</span>
                  <strong class="detail-val">{{ acc.accountId }}</strong>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Região Padrão:</span>
                  <span class="detail-val">{{ acc.regionDefault }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Credencial:</span>
                  <span class="detail-val credential-code" title="{{ acc.arnOrKey }}">{{
                    acc.arnOrKey
                  }}</span>
                </div>
              </div>
            </div>

            <div class="acc-footer">
              <div class="acc-spend">
                <span class="spend-caption">Spend Mensal Coletado</span>
                <span class="spend-val font-mono">\${{ acc.monthlySpend | number: '1.2-2' }}</span>
              </div>

              <div class="acc-sync-info">
                <span class="sync-label">Último Scan</span>
                <span class="sync-time font-mono">{{ acc.lastSyncedAt }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- CREATE / EDIT MODAL -->
      <app-modal
        [isOpen]="isFormModalOpen()"
        [title]="editingAccount() ? 'Editar Parâmetros da Conexão' : 'Conectar Nova Conta de Nuvem'"
        [subtitle]="'Integração via política IAM Read-Only ou agente de telemetria.'"
        maxWidth="540px"
        (close)="closeFormModal()"
      >
        <form (ngSubmit)="saveAccount()" class="acc-form">
          <div class="form-group">
            <label class="form-label">Identificação da Conta *</label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="formData.name"
              name="name"
              placeholder="ex: AWS Core Production (Master Payer)"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Provedor de Nuvem *</label>
              <select class="form-select" [(ngModel)]="formData.provider" name="provider">
                <option value="AWS">Amazon Web Services (AWS)</option>
                <option value="GCP">Google Cloud Platform (GCP)</option>
                <option value="Azure">Microsoft Azure</option>
                <option value="Kubernetes">Kubernetes Dedicated Cluster</option>
              </select>
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Ambiente *</label>
              <select class="form-select" [(ngModel)]="formData.environment" name="environment">
                <option value="Production">Produção (Prod)</option>
                <option value="Staging">Staging & QA</option>
                <option value="Development">Desenvolvimento</option>
                <option value="Shared">Serviços Compartilhados</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Account ID / Subscription / Cluster ID *</label>
              <input
                type="text"
                class="form-input font-mono"
                [(ngModel)]="formData.accountId"
                name="accountId"
                placeholder="ex: 8492-1049-5821"
                required
              />
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Região Padrão</label>
              <input
                type="text"
                class="form-input font-mono"
                [(ngModel)]="formData.regionDefault"
                name="regionDefault"
                placeholder="ex: us-east-1"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">IAM Role ARN / Service Account / Key *</label>
            <input
              type="text"
              class="form-input font-mono"
              [(ngModel)]="formData.arnOrKey"
              name="arnOrKey"
              placeholder="ex: arn:aws:iam::849210495821:role/ZenithFinOpsRole"
              required
            />
            <small class="text-muted" style="font-size: 0.72rem; margin-top: 4px;">
              Requer apenas permissões de leitura (ex: CostExplorer:GetCostAndUsage, CloudWatch:GetMetricData).
            </small>
          </div>

          <div class="form-group">
            <label class="form-label">Gasto Mensal Estimado ($ USD)</label>
            <input
              type="number"
              class="form-input font-mono"
              [(ngModel)]="formData.monthlySpend"
              name="monthlySpend"
              min="0"
              step="500"
              placeholder="ex: 12000"
            />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeFormModal()">
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="!formData.name || !formData.accountId || !formData.arnOrKey"
            >
              {{ editingAccount() ? 'Salvar Configurações' : 'Conectar Conta' }}
            </button>
          </div>
        </form>
      </app-modal>

      <!-- DELETE MODAL -->
      <app-modal
        [isOpen]="isDeleteModalOpen()"
        title="Desconectar Conta de Nuvem"
        subtitle="O histórico de telemetria desta conta deixará de ser sincronizado."
        maxWidth="440px"
        (close)="isDeleteModalOpen.set(false)"
      >
        <div class="delete-content">
          <p>
            Deseja desconectar a conta
            <strong>"{{ accountToDelete()?.name }}"</strong> ({{ accountToDelete()?.accountId }})?
          </p>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="isDeleteModalOpen.set(false)">
              Cancelar
            </button>
            <button type="button" class="btn btn-danger" (click)="confirmDelete()">
              Desconectar
            </button>
          </div>
        </div>
      </app-modal>
    </div>
  `,
  styles: [
    `
      .accounts-page {
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

      .stats-banner {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
        padding: 16px 20px;
        background-color: var(--bg-secondary);
      }

      .stat-cell {
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

      .stat-num {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .accounts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
        gap: 16px;
      }

      .account-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 16px;
        padding: 20px;
      }

      .acc-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .acc-badge-area {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .dot-indicator {
        width: 6px;
        height: 6px;
        border-radius: var(--radius-full);
        background-color: var(--accent-primary);
      }

      .dot-spinning {
        animation: spin 1s linear infinite;
      }

      .acc-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .acc-body {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .acc-name {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--text-primary);
        letter-spacing: -0.01em;
      }

      .acc-details-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.78rem;
        background-color: var(--bg-tertiary);
        padding: 10px 12px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-muted);
      }

      .detail-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .detail-label {
        color: var(--text-muted);
      }

      .detail-val {
        color: var(--text-primary);
      }

      .credential-code {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--text-secondary);
      }

      .acc-footer {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        border-top: 1px solid var(--border-muted);
        padding-top: 12px;
      }

      .acc-spend {
        display: flex;
        flex-direction: column;
      }

      .spend-caption {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: uppercase;
      }

      .spend-val {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .acc-sync-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .sync-label {
        font-size: 0.7rem;
        color: var(--text-muted);
      }

      .sync-time {
        font-size: 0.75rem;
        color: var(--text-secondary);
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

      .spinning {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class AccountsComponent {
  readonly dataService = inject(FinOpsDataService);

  readonly isFormModalOpen = signal<boolean>(false);
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly editingAccount = signal<CloudAccount | null>(null);
  readonly accountToDelete = signal<CloudAccount | null>(null);

  formData: {
    name: string;
    provider: CloudProvider;
    accountId: string;
    environment: Environment;
    monthlySpend: number;
    arnOrKey: string;
    regionDefault: string;
  } = {
    name: '',
    provider: 'AWS',
    accountId: '',
    environment: 'Production',
    monthlySpend: 5000,
    arnOrKey: '',
    regionDefault: 'us-east-1',
  };

  openCreateModal(): void {
    this.editingAccount.set(null);
    this.formData = {
      name: '',
      provider: 'AWS',
      accountId: '',
      environment: 'Production',
      monthlySpend: 5000,
      arnOrKey: '',
      regionDefault: 'us-east-1',
    };
    this.isFormModalOpen.set(true);
  }

  openEditModal(acc: CloudAccount): void {
    this.editingAccount.set(acc);
    this.formData = {
      name: acc.name,
      provider: acc.provider,
      accountId: acc.accountId,
      environment: acc.environment,
      monthlySpend: acc.monthlySpend,
      arnOrKey: acc.arnOrKey,
      regionDefault: acc.regionDefault,
    };
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
    this.editingAccount.set(null);
  }

  saveAccount(): void {
    const target = this.editingAccount();
    if (target) {
      this.dataService.updateAccount(target.id, this.formData);
    } else {
      this.dataService.createAccount(this.formData);
    }
    this.closeFormModal();
  }

  openDeleteModal(acc: CloudAccount): void {
    this.accountToDelete.set(acc);
    this.isDeleteModalOpen.set(true);
  }

  confirmDelete(): void {
    const item = this.accountToDelete();
    if (item) {
      this.dataService.deleteAccount(item.id);
    }
    this.isDeleteModalOpen.set(false);
    this.accountToDelete.set(null);
  }
}
