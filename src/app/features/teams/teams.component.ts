import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinOpsDataService } from '../../core/services/finops-data.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Team } from '../../core/models/finops.model';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="teams-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="header-pre-title">
            <span>GOVERNANÇA POR SQUADS & SHOWBACK FINOPS</span>
            <span class="separator">•</span>
            <span>MÓDULO CRUD 4</span>
          </div>
          <h1 class="page-title">Gestão de Custos por Time</h1>
          <p class="page-subtitle">
            Descentralize a responsabilidade orçamentária por esquadras (Desenvolvimento, Suporte, Dados e SRE), acompanhe custos unitários por engenheiro e centros de custo.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-primary" (click)="openCreateModal()">
            <app-icon name="plus" [size]="15" />
            Cadastrar Novo Time
          </button>
        </div>
      </div>

      <!-- Unit Economics & Teams Stats Banner -->
      <div class="card teams-kpi-banner">
        <div class="kpi-cell">
          <span class="kpi-label">Times Cadastrados</span>
          <span class="kpi-val font-mono">{{ dataService.teams().length }} times</span>
          <span class="kpi-sub font-mono">100% com centro de custo</span>
        </div>

        <div class="kpi-separator"></div>

        <div class="kpi-cell">
          <span class="kpi-label">Custo Médio / Integrante</span>
          <span class="kpi-val font-mono">\${{ dataService.averageCostPerMember() | number: '1.0-0' }}</span>
          <span class="kpi-sub font-mono">Unit Economics por membro</span>
        </div>

        <div class="kpi-separator"></div>

        <div class="kpi-cell">
          <span class="kpi-label">Membros e Engenheiros</span>
          <span class="kpi-val font-mono">{{ dataService.totalEngineersAndMembers() }} pessoas</span>
          <span class="kpi-sub font-mono">Nas esquadras de tecnologia</span>
        </div>

        <div class="kpi-separator"></div>

        <div class="kpi-cell">
          <span class="kpi-label">Orçamento Total dos Times</span>
          <span class="kpi-val font-mono">\${{ dataService.totalAllocatedTeamBudget() | number: '1.0-0' }}</span>
          <span class="kpi-sub font-mono">Tetos descentralizados</span>
        </div>
      </div>

      <!-- Toolbar & Search -->
      <div class="card toolbar-card">
        <div class="search-input-wrap">
          <app-icon name="search" [size]="14" class="search-icon" />
          <input
            type="text"
            class="form-input search-input"
            placeholder="Pesquisar por nome do time, centro de custo (CC), líder ou tag..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
          />
          @if (searchQuery()) {
            <button class="btn-clear" (click)="searchQuery.set('')">
              <app-icon name="x" [size]="12" />
            </button>
          }
        </div>

        <div class="global-filter-hint font-mono">
          <span>Dica: Clique em "Ver Custos" em qualquer card para filtrar o Cost Explorer por aquele time.</span>
        </div>
      </div>

      <!-- Teams Grid -->
      <div class="teams-grid">
        @for (team of filteredTeams(); track team.id) {
          @let pct = (team.currentMonthlySpend / Math.max(1, team.allocatedMonthlyBudget)) * 100;
          @let costPerMember = Math.round(team.currentMonthlySpend / Math.max(1, team.memberCount));
          @let isExceeded = pct >= 100;
          @let isWarning = pct >= 80 && pct < 100;

          <div class="card team-card" [class.border-critical]="isExceeded" [class.border-warning]="isWarning">
            <div class="team-top">
              <div class="team-badge-group">
                <span class="badge font-mono cost-center-badge">{{ team.costCenter }}</span>
                <span class="badge badge-outline font-mono">{{ team.memberCount }} integrantes</span>
                @if (isExceeded) {
                  <span class="badge badge-critical font-mono">ORÇAMENTO ESTOURADO</span>
                } @else if (isWarning) {
                  <span class="badge badge-warning font-mono">ALERTA 80%</span>
                } @else {
                  <span class="badge font-mono">DENTRO DO TETO</span>
                }
              </div>

              <div class="team-actions">
                <button
                  class="btn btn-ghost btn-icon"
                  title="Editar Time"
                  (click)="openEditModal(team)"
                >
                  <app-icon name="edit" [size]="14" />
                </button>
                <button
                  class="btn btn-danger btn-icon"
                  title="Excluir Time"
                  (click)="openDeleteModal(team)"
                >
                  <app-icon name="trash" [size]="14" />
                </button>
              </div>
            </div>

            <!-- Team Header & Leader -->
            <div class="team-header-info">
              <h3 class="team-title">{{ team.name }}</h3>
              <p class="team-leader">
                <span class="leader-label">Liderança:</span>
                <strong>{{ team.leader }}</strong>
              </p>
              @if (team.description) {
                <p class="team-desc">{{ team.description }}</p>
              }
            </div>

            <!-- Financials & Unit Economics Box -->
            <div class="team-finance-box">
              <div class="finance-row">
                <div class="finance-col">
                  <span class="fin-label">Spend Atual do Time (MTD)</span>
                  <span class="fin-val font-mono">\${{ team.currentMonthlySpend | number: '1.0-0' }}</span>
                </div>
                <div class="finance-col text-right">
                  <span class="fin-label">Teto Orçado do Time</span>
                  <span class="fin-val font-mono font-muted">\${{ team.allocatedMonthlyBudget | number: '1.0-0' }}</span>
                </div>
              </div>

              <!-- Progress bar of team spend -->
              <div class="team-progress-wrap">
                <div class="progress-info font-mono">
                  <span>Burn Rate: <strong>{{ pct | number: '1.1-1' }}%</strong></span>
                  <span>
                    @if (team.allocatedMonthlyBudget >= team.currentMonthlySpend) {
                      Resta: \${{ (team.allocatedMonthlyBudget - team.currentMonthlySpend) | number: '1.0-0' }}
                    } @else {
                      Excedeu: \${{ (team.currentMonthlySpend - team.allocatedMonthlyBudget) | number: '1.0-0' }}
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

              <!-- Unit Economics Metric -->
              <div class="unit-economics-chip font-mono">
                <div class="ue-label">
                  <app-icon name="users" [size]="13" />
                  <span>Custo Unitário:</span>
                </div>
                <strong class="ue-val">\${{ costPerMember | number: '1.0-0' }} / membro</strong>
              </div>
            </div>

            <!-- Channels & Tags Footer -->
            <div class="team-footer">
              <div class="team-channels font-mono">
                @if (team.slackChannel) {
                  <span class="channel-pill" title="Slack do time"># {{ team.slackChannel }}</span>
                }
                @if (team.contactEmail) {
                  <span class="channel-pill" title="Email de contato">✉ {{ team.contactEmail }}</span>
                }
              </div>

              <div class="team-card-actions">
                <button class="btn btn-secondary btn-sm" (click)="filterCostExplorerByTeam(team.id)">
                  <app-icon name="chart" [size]="13" />
                  Ver Custos no Explorer
                </button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state-full card">
            <app-icon name="users" [size]="32" />
            <h3>Nenhum time encontrado</h3>
            <p>Tente ajustar a busca ou cadastre uma nova equipe para governança de custos.</p>
            <button class="btn btn-primary btn-sm" (click)="openCreateModal()">
              Cadastrar Novo Time
            </button>
          </div>
        }
      </div>

      <!-- CREATE / EDIT MODAL -->
      <app-modal
        [isOpen]="isFormModalOpen()"
        [title]="editingTeam() ? 'Editar Time de Engenharia' : 'Cadastrar Novo Time & Centro de Custo'"
        [subtitle]="'Configure o teto orçamentário específico, líder da esquadra e centro de custo corporativo.'"
        maxWidth="560px"
        (close)="closeFormModal()"
      >
        <form (ngSubmit)="saveTeam()" class="team-form">
          <div class="form-group">
            <label class="form-label">Nome do Time / Squad *</label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="formData.name"
              name="name"
              placeholder="ex: Time de Suporte & Customer Ops"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Centro de Custo (Cost Center) *</label>
              <input
                type="text"
                class="form-input font-mono"
                [(ngModel)]="formData.costCenter"
                name="costCenter"
                placeholder="ex: CC-OPS-202"
                required
              />
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Líder / Tech Lead Responsável *</label>
              <input
                type="text"
                class="form-input"
                [(ngModel)]="formData.leader"
                name="leader"
                placeholder="ex: Mariana Rios"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Teto Orçado Mensal ($ USD) *</label>
              <input
                type="number"
                class="form-input font-mono"
                [(ngModel)]="formData.allocatedMonthlyBudget"
                name="allocatedMonthlyBudget"
                min="500"
                step="500"
                placeholder="ex: 15000"
                required
              />
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Número de Integrantes (Membros) *</label>
              <input
                type="number"
                class="form-input font-mono"
                [(ngModel)]="formData.memberCount"
                name="memberCount"
                min="1"
                step="1"
                placeholder="ex: 12"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">E-mail do Time / Líder</label>
              <input
                type="email"
                class="form-input"
                [(ngModel)]="formData.contactEmail"
                name="contactEmail"
                placeholder="squad@empresa.io"
              />
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Canal do Slack</label>
              <input
                type="text"
                class="form-input"
                [(ngModel)]="formData.slackChannel"
                name="slackChannel"
                placeholder="#ops-support"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Tags de Identificação (separadas por vírgula)</label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="tagString"
              name="tagString"
              placeholder="ex: Support, CustomerOps, Egress, Tier3"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Escopo & Descrição da Atuação</label>
            <textarea
              class="form-textarea"
              rows="2"
              [(ngModel)]="formData.description"
              name="description"
              placeholder="Descreva a finalidade e serviços de nuvem sob responsabilidade deste time..."
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeFormModal()">
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="!formData.name || !formData.costCenter || !formData.leader || formData.allocatedMonthlyBudget <= 0"
            >
              {{ editingTeam() ? 'Salvar Alterações' : 'Cadastrar Time' }}
            </button>
          </div>
        </form>
      </app-modal>

      <!-- DELETE MODAL -->
      <app-modal
        [isOpen]="isDeleteModalOpen()"
        title="Excluir Time de Engenharia"
        subtitle="Esta ação removerá o time e sua respectiva alocação orçamentária."
        maxWidth="440px"
        (close)="isDeleteModalOpen.set(false)"
      >
        <div class="delete-content">
          <p>
            Tem certeza que deseja excluir o time
            <strong>"{{ teamToDelete()?.name }}"</strong> ({{ teamToDelete()?.costCenter }})?
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
      .teams-page {
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
        max-width: 680px;
      }

      .teams-kpi-banner {
        display: grid;
        grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
        align-items: center;
        padding: 20px 24px;
        gap: 16px;
        background-color: var(--bg-secondary);
      }

      @media (max-width: 960px) {
        .teams-kpi-banner {
          grid-template-columns: 1fr 1fr;
        }
        .kpi-separator {
          display: none;
        }
      }

      @media (max-width: 580px) {
        .teams-kpi-banner {
          grid-template-columns: 1fr;
        }
      }

      .kpi-separator {
        width: 1px;
        height: 48px;
        background-color: var(--border-subtle);
      }

      .kpi-cell {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .kpi-label {
        font-size: 0.72rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 500;
      }

      .kpi-val {
        font-size: 1.6rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--text-primary);
      }

      .kpi-sub {
        font-size: 0.74rem;
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
        max-width: 440px;
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

      .global-filter-hint {
        font-size: 0.74rem;
        color: var(--text-muted);
      }

      .teams-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        gap: 16px;
      }

      .team-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 16px;
        padding: 20px;
        transition: border-color var(--transition-fast);
      }

      .border-warning {
        border-color: #71717a;
      }

      .border-critical {
        border-color: #ffffff;
      }

      .team-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .team-badge-group {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .cost-center-badge {
        background-color: var(--bg-tertiary);
        border-color: var(--border-focus);
        color: var(--text-primary);
        font-weight: 700;
      }

      .team-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .team-header-info {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .team-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.01em;
      }

      .team-leader {
        font-size: 0.82rem;
        color: var(--text-secondary);
      }
      .leader-label {
        color: var(--text-muted);
        margin-right: 4px;
      }

      .team-desc {
        font-size: 0.8rem;
        color: var(--text-secondary);
        line-height: 1.4;
      }

      .team-finance-box {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px 14px;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-muted);
        border-radius: var(--radius-sm);
      }

      .finance-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .finance-col {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .fin-label {
        font-size: 0.68rem;
        color: var(--text-muted);
        text-transform: uppercase;
      }

      .fin-val {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .team-progress-wrap {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .progress-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.74rem;
        color: var(--text-secondary);
      }

      .progress-track {
        width: 100%;
        height: 5px;
        background-color: var(--bg-primary);
        border-radius: var(--radius-full);
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background-color: var(--text-primary);
        border-radius: var(--radius-full);
      }

      .unit-economics-chip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        font-size: 0.78rem;
      }

      .ue-label {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--text-muted);
      }

      .ue-val {
        color: var(--text-primary);
      }

      .team-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid var(--border-muted);
        padding-top: 12px;
        flex-wrap: wrap;
        gap: 10px;
      }

      .team-channels {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.74rem;
        color: var(--text-muted);
        flex-wrap: wrap;
      }

      .channel-pill {
        padding: 2px 6px;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-muted);
        border-radius: 4px;
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
export class TeamsComponent {
  readonly dataService = inject(FinOpsDataService);

  readonly searchQuery = signal<string>('');
  readonly isFormModalOpen = signal<boolean>(false);
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly editingTeam = signal<Team | null>(null);
  readonly teamToDelete = signal<Team | null>(null);

  protected readonly Math = Math;

  tagString = '';
  formData: {
    name: string;
    slug: string;
    costCenter: string;
    leader: string;
    contactEmail: string;
    slackChannel: string;
    allocatedMonthlyBudget: number;
    memberCount: number;
    description: string;
  } = {
    name: '',
    slug: '',
    costCenter: '',
    leader: '',
    contactEmail: '',
    slackChannel: '',
    allocatedMonthlyBudget: 15000,
    memberCount: 8,
    description: '',
  };

  readonly filteredTeams = computed(() => {
    let list = this.dataService.teams();
    const query = this.searchQuery().toLowerCase().trim();

    if (query) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.costCenter.toLowerCase().includes(query) ||
          t.leader.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return list;
  });

  openCreateModal(): void {
    this.editingTeam.set(null);
    this.tagString = '';
    this.formData = {
      name: '',
      slug: '',
      costCenter: 'CC-OPS-' + Math.floor(100 + Math.random() * 900),
      leader: '',
      contactEmail: '',
      slackChannel: '',
      allocatedMonthlyBudget: 15000,
      memberCount: 8,
      description: '',
    };
    this.isFormModalOpen.set(true);
  }

  openEditModal(team: Team): void {
    this.editingTeam.set(team);
    this.tagString = (team.tags || []).join(', ');
    this.formData = {
      name: team.name,
      slug: team.slug,
      costCenter: team.costCenter,
      leader: team.leader,
      contactEmail: team.contactEmail,
      slackChannel: team.slackChannel,
      allocatedMonthlyBudget: team.allocatedMonthlyBudget,
      memberCount: team.memberCount,
      description: team.description,
    };
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
    this.editingTeam.set(null);
  }

  saveTeam(): void {
    const tags = this.tagString
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const target = this.editingTeam();
    if (target) {
      this.dataService.updateTeam(target.id, {
        ...this.formData,
        tags,
      });
    } else {
      this.dataService.createTeam({
        ...this.formData,
        slug: this.formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        currentMonthlySpend: Math.round(this.formData.allocatedMonthlyBudget * 0.72),
        tags,
      });
    }
    this.closeFormModal();
  }

  openDeleteModal(team: Team): void {
    this.teamToDelete.set(team);
    this.isDeleteModalOpen.set(true);
  }

  confirmDelete(): void {
    const item = this.teamToDelete();
    if (item) {
      this.dataService.deleteTeam(item.id);
    }
    this.isDeleteModalOpen.set(false);
    this.teamToDelete.set(null);
  }

  filterCostExplorerByTeam(teamId: string): void {
    this.dataService.setGlobalTeam(teamId);
    this.dataService.setTab('cost-explorer');
  }
}
