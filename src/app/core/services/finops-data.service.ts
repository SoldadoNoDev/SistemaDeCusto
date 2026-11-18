import { Injectable, signal, computed } from '@angular/core';
import {
  Budget,
  SavingsRecommendation,
  CloudAccount,
  CostAnomaly,
  CostExplorerItem,
  DailySpendPoint,
  Toast,
  CloudProvider,
  Team,
} from '../models/finops.model';

const STORAGE_KEY_TEAMS = 'zenith_finops_teams';
const STORAGE_KEY_BUDGETS = 'zenith_finops_budgets';
const STORAGE_KEY_RECOMMENDATIONS = 'zenith_finops_recommendations';
const STORAGE_KEY_ACCOUNTS = 'zenith_finops_accounts';
const STORAGE_KEY_ANOMALIES = 'zenith_finops_anomalies';
const STORAGE_KEY_EXPLORER = 'zenith_finops_cost_items';
const STORAGE_KEY_THEME = 'zenith_finops_theme';

@Injectable({
  providedIn: 'root',
})
export class FinOpsDataService {
  // Theme State
  readonly theme = signal<'dark' | 'light'>(
    (localStorage.getItem(STORAGE_KEY_THEME) as 'dark' | 'light') || 'dark'
  );

  // Active View State
  readonly activeTab = signal<string>('overview');

  // Global Active Team Filter ('All' or teamId)
  readonly selectedGlobalTeam = signal<string>('All');

  // Main Data Signals
  readonly teams = signal<Team[]>(this.loadFromStorage(STORAGE_KEY_TEAMS, this.defaultTeams));
  readonly budgets = signal<Budget[]>(this.loadFromStorage(STORAGE_KEY_BUDGETS, this.defaultBudgets));
  readonly recommendations = signal<SavingsRecommendation[]>(
    this.loadFromStorage(STORAGE_KEY_RECOMMENDATIONS, this.defaultRecommendations)
  );
  readonly accounts = signal<CloudAccount[]>(
    this.loadFromStorage(STORAGE_KEY_ACCOUNTS, this.defaultAccounts)
  );
  readonly anomalies = signal<CostAnomaly[]>(
    this.loadFromStorage(STORAGE_KEY_ANOMALIES, this.defaultAnomalies)
  );
  readonly costExplorerItems = signal<CostExplorerItem[]>(
    this.loadFromStorage(STORAGE_KEY_EXPLORER, this.defaultCostExplorerItems)
  );

  // Active Toast Signal
  readonly toast = signal<Toast | null>(null);

  // Computed Financial Metrics
  readonly totalSpendMTD = computed(() => {
    return this.accounts().reduce((acc, account) => acc + account.monthlySpend, 0);
  });

  readonly previousMonthSpend = computed(() => {
    return this.totalSpendMTD() * 0.942; // Baseline prior month
  });

  readonly spendDeltaPercentage = computed(() => {
    const prev = this.previousMonthSpend();
    if (!prev) return 0;
    return Number((((this.totalSpendMTD() - prev) / prev) * 100).toFixed(1));
  });

  readonly projectedSpendEndOfMonth = computed(() => {
    const today = new Date().getDate();
    const daysInMonth = 30;
    const dailyRunRate = this.totalSpendMTD() / Math.max(1, today);
    return Math.round(this.totalSpendMTD() + dailyRunRate * (daysInMonth - today));
  });

  readonly totalSavingsPotential = computed(() => {
    return this.recommendations()
      .filter((r) => r.status === 'Open' || r.status === 'In Review')
      .reduce((acc, r) => acc + r.estimatedSavingsMonthly, 0);
  });

  readonly realizedSavings = computed(() => {
    return this.recommendations()
      .filter((r) => r.status === 'Applied')
      .reduce((acc, r) => acc + r.estimatedSavingsMonthly, 0);
  });

  readonly activeAnomaliesCount = computed(() => {
    return this.anomalies().filter((a) => a.status === 'Investigating').length;
  });

  readonly averageBudgetHealth = computed(() => {
    const list = this.budgets();
    if (list.length === 0) return 0;
    const totalPercentage = list.reduce(
      (sum, b) => sum + (b.currentSpend / Math.max(1, b.amount)) * 100,
      0
    );
    return Number((totalPercentage / list.length).toFixed(1));
  });

  // Team Unit Economics & Metrics
  readonly totalAllocatedTeamBudget = computed(() => {
    return this.teams().reduce((sum, t) => sum + t.allocatedMonthlyBudget, 0);
  });

  readonly totalTeamSpend = computed(() => {
    return this.teams().reduce((sum, t) => sum + t.currentMonthlySpend, 0);
  });

  readonly totalEngineersAndMembers = computed(() => {
    return this.teams().reduce((sum, t) => sum + t.memberCount, 0);
  });

  readonly averageCostPerMember = computed(() => {
    const members = this.totalEngineersAndMembers();
    if (members === 0) return 0;
    return Math.round(this.totalSpendMTD() / members);
  });

  readonly providerDistribution = computed(() => {
    const map: Record<CloudProvider, number> = {
      AWS: 0,
      GCP: 0,
      Azure: 0,
      Kubernetes: 0,
    };
    this.accounts().forEach((acc) => {
      map[acc.provider] = (map[acc.provider] || 0) + acc.monthlySpend;
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return {
      AWS: { amount: map.AWS, percent: Math.round((map.AWS / total) * 100) },
      GCP: { amount: map.GCP, percent: Math.round((map.GCP / total) * 100) },
      Azure: { amount: map.Azure, percent: Math.round((map.Azure / total) * 100) },
      Kubernetes: { amount: map.Kubernetes, percent: Math.round((map.Kubernetes / total) * 100) },
    };
  });

  // Daily Spend Trend
  readonly dailySpendTrend: DailySpendPoint[] = [
    { day: '01 Nov', spend: 1950 },
    { day: '02 Nov', spend: 2010 },
    { day: '03 Nov', spend: 1890 },
    { day: '04 Nov', spend: 2150 },
    { day: '05 Nov', spend: 2200 },
    { day: '06 Nov', spend: 2180 },
    { day: '07 Nov', spend: 2450 },
    { day: '08 Nov', spend: 2390 },
    { day: '09 Nov', spend: 2410 },
    { day: '10 Nov', spend: 2380 },
    { day: '11 Nov', spend: 2520 },
    { day: '12 Nov', spend: 2490 },
    { day: '13 Nov', spend: 2610 },
    { day: '14 Nov', spend: 2750 },
    { day: '15 Nov', spend: 2820 },
    { day: '16 Nov', spend: 2900 },
    { day: '17 Nov', spend: 2950 },
    { day: '18 Nov', spend: 3040, forecast: 3040 },
    { day: '19 Nov', spend: 0, forecast: 3080 },
    { day: '20 Nov', spend: 0, forecast: 3120 },
    { day: '21 Nov', spend: 0, forecast: 3150 },
    { day: '22 Nov', spend: 0, forecast: 3190 },
    { day: '23 Nov', spend: 0, forecast: 3210 },
    { day: '24 Nov', spend: 0, forecast: 3250 },
    { day: '25 Nov', spend: 0, forecast: 3290 },
    { day: '26 Nov', spend: 0, forecast: 3310 },
    { day: '27 Nov', spend: 0, forecast: 3350 },
    { day: '28 Nov', spend: 0, forecast: 3380 },
    { day: '29 Nov', spend: 0, forecast: 3410 },
    { day: '30 Nov', spend: 0, forecast: 3450 },
  ];

  constructor() {
    this.applyTheme(this.theme());
  }

  // --- THEME SWITCHER ---
  toggleTheme(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    localStorage.setItem(STORAGE_KEY_THEME, next);
    this.applyTheme(next);
  }

  private applyTheme(theme: 'dark' | 'light'): void {
    if (typeof document !== 'undefined') {
      if (theme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
      }
    }
  }

  // --- TAB NAVIGATION & TEAM FILTER ---
  setTab(tab: string): void {
    this.activeTab.set(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setGlobalTeam(teamId: string): void {
    this.selectedGlobalTeam.set(teamId);
    const team = this.teams().find((t) => t.id === teamId);
    if (team) {
      this.showToast('Filtro por Time Aplicado', `Visualizando métricas exclusivas de: ${team.name}`, 'info');
    } else {
      this.showToast('Visão Global Ativa', 'Visualizando métricas consolidadas de todos os times.', 'info');
    }
  }

  // --- TOAST NOTIFICATIONS ---
  showToast(title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success'): void {
    const newToast: Toast = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
    };
    this.toast.set(newToast);
    setTimeout(() => {
      if (this.toast()?.id === newToast.id) {
        this.toast.set(null);
      }
    }, 4500);
  }

  clearToast(): void {
    this.toast.set(null);
  }

  // --- CRUD: TEAMS (NOVO MÓDULO) ---
  createTeam(team: Omit<Team, 'id' | 'createdAt'>): void {
    const newItem: Team = {
      ...team,
      id: 'team-' + Math.random().toString(36).substring(2, 8),
      createdAt: new Date().toISOString(),
    };
    const updated = [...this.teams(), newItem];
    this.teams.set(updated);
    this.saveToStorage(STORAGE_KEY_TEAMS, updated);
    this.showToast('Time Cadastrado', `O time "${newItem.name}" foi registrado com sucesso.`);
  }

  updateTeam(id: string, updates: Partial<Team>): void {
    const updated = this.teams().map((t) => (t.id === id ? { ...t, ...updates } : t));
    this.teams.set(updated);
    this.saveToStorage(STORAGE_KEY_TEAMS, updated);
    this.showToast('Time Atualizado', 'Os dados e limites orçamentários do time foram salvos.');
  }

  deleteTeam(id: string): void {
    const target = this.teams().find((t) => t.id === id);
    const updated = this.teams().filter((t) => t.id !== id);
    this.teams.set(updated);
    this.saveToStorage(STORAGE_KEY_TEAMS, updated);
    if (this.selectedGlobalTeam() === id) {
      this.selectedGlobalTeam.set('All');
    }
    this.showToast('Time Excluído', `O time "${target?.name || id}" foi desvinculado.`, 'info');
  }

  // --- CRUD: BUDGETS ---
  createBudget(budget: Omit<Budget, 'id' | 'createdAt'>): void {
    const newItem: Budget = {
      ...budget,
      id: 'bdg-' + Math.random().toString(36).substring(2, 8),
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...this.budgets()];
    this.budgets.set(updated);
    this.saveToStorage(STORAGE_KEY_BUDGETS, updated);
    this.showToast('Orçamento Criado', `O orçamento "${newItem.name}" foi registrado com sucesso.`);
  }

  updateBudget(id: string, updates: Partial<Budget>): void {
    const updated = this.budgets().map((b) => (b.id === id ? { ...b, ...updates } : b));
    this.budgets.set(updated);
    this.saveToStorage(STORAGE_KEY_BUDGETS, updated);
    this.showToast('Orçamento Atualizado', 'As alterações de teto e alertas foram salvas.');
  }

  deleteBudget(id: string): void {
    const target = this.budgets().find((b) => b.id === id);
    const updated = this.budgets().filter((b) => b.id !== id);
    this.budgets.set(updated);
    this.saveToStorage(STORAGE_KEY_BUDGETS, updated);
    this.showToast('Orçamento Removido', `O orçamento "${target?.name || id}" foi excluído.`, 'info');
  }

  // --- CRUD: RECOMMENDATIONS ---
  createRecommendation(item: Omit<SavingsRecommendation, 'id' | 'createdAt'>): void {
    const newItem: SavingsRecommendation = {
      ...item,
      id: 'rec-' + Math.random().toString(36).substring(2, 8),
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...this.recommendations()];
    this.recommendations.set(updated);
    this.saveToStorage(STORAGE_KEY_RECOMMENDATIONS, updated);
    this.showToast('Recomendação Criada', `Oportunidade "${newItem.title}" adicionada ao catálogo.`);
  }

  updateRecommendation(id: string, updates: Partial<SavingsRecommendation>): void {
    const updated = this.recommendations().map((r) => (r.id === id ? { ...r, ...updates } : r));
    this.recommendations.set(updated);
    this.saveToStorage(STORAGE_KEY_RECOMMENDATIONS, updated);
    this.showToast('Otimização Atualizada', 'A recomendação de FinOps foi revisada.');
  }

  applyRecommendation(id: string): void {
    const item = this.recommendations().find((r) => r.id === id);
    if (!item) return;
    const updated = this.recommendations().map((r) =>
      r.id === id ? { ...r, status: 'Applied' as const, appliedAt: new Date().toISOString() } : r
    );
    this.recommendations.set(updated);
    this.saveToStorage(STORAGE_KEY_RECOMMENDATIONS, updated);
    this.showToast(
      'Otimização Aplicada!',
      `Economia de $${item.estimatedSavingsMonthly.toLocaleString('en-US')}/mês consolidada na fatura.`,
      'success'
    );
  }

  deleteRecommendation(id: string): void {
    const updated = this.recommendations().filter((r) => r.id !== id);
    this.recommendations.set(updated);
    this.saveToStorage(STORAGE_KEY_RECOMMENDATIONS, updated);
    this.showToast('Recomendação Descartada', 'Oportunidade removida da lista.', 'info');
  }

  // --- CRUD: CLOUD ACCOUNTS ---
  createAccount(account: Omit<CloudAccount, 'id' | 'createdAt' | 'lastSyncedAt' | 'syncStatus'>): void {
    const newItem: CloudAccount = {
      ...account,
      id: 'acc-' + Math.random().toString(36).substring(2, 8),
      syncStatus: 'Synced',
      lastSyncedAt: 'Agora mesmo',
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...this.accounts()];
    this.accounts.set(updated);
    this.saveToStorage(STORAGE_KEY_ACCOUNTS, updated);
    this.showToast('Conta Conectada', `Conexão com ${newItem.provider} (${newItem.name}) estabelecida.`);
  }

  updateAccount(id: string, updates: Partial<CloudAccount>): void {
    const updated = this.accounts().map((a) => (a.id === id ? { ...a, ...updates } : a));
    this.accounts.set(updated);
    this.saveToStorage(STORAGE_KEY_ACCOUNTS, updated);
    this.showToast('Conta Atualizada', 'Os parâmetros da conexão de nuvem foram salvos.');
  }

  deleteAccount(id: string): void {
    const target = this.accounts().find((a) => a.id === id);
    const updated = this.accounts().filter((a) => a.id !== id);
    this.accounts.set(updated);
    this.saveToStorage(STORAGE_KEY_ACCOUNTS, updated);
    this.showToast('Conta Desconectada', `A conta "${target?.name || id}" foi desvinculada.`, 'info');
  }

  syncAccount(id: string): void {
    const syncingList = this.accounts().map((a) =>
      a.id === id ? { ...a, syncStatus: 'Syncing' as const } : a
    );
    this.accounts.set(syncingList);

    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const completedList = this.accounts().map((a) =>
        a.id === id ? { ...a, syncStatus: 'Synced' as const, lastSyncedAt: `Hoje às ${timeStr}` } : a
      );
      this.accounts.set(completedList);
      this.saveToStorage(STORAGE_KEY_ACCOUNTS, completedList);
      this.showToast('Sincronização Concluída', 'Métricas de telemetria e custo foram atualizadas com sucesso.');
    }, 1200);
  }

  // --- ANOMALY ACTIONS ---
  updateAnomalyStatus(id: string, status: CostAnomaly['status']): void {
    const updated = this.anomalies().map((a) => (a.id === id ? { ...a, status } : a));
    this.anomalies.set(updated);
    this.saveToStorage(STORAGE_KEY_ANOMALIES, updated);
    this.showToast('Status de Anomalia', `Anomalia atualizada para: ${status}`);
  }

  // --- RESET DEMO DATA ---
  resetToDefaultDemoData(): void {
    localStorage.removeItem(STORAGE_KEY_TEAMS);
    localStorage.removeItem(STORAGE_KEY_BUDGETS);
    localStorage.removeItem(STORAGE_KEY_RECOMMENDATIONS);
    localStorage.removeItem(STORAGE_KEY_ACCOUNTS);
    localStorage.removeItem(STORAGE_KEY_ANOMALIES);
    localStorage.removeItem(STORAGE_KEY_EXPLORER);

    this.teams.set(this.defaultTeams);
    this.budgets.set(this.defaultBudgets);
    this.recommendations.set(this.defaultRecommendations);
    this.accounts.set(this.defaultAccounts);
    this.anomalies.set(this.defaultAnomalies);
    this.costExplorerItems.set(this.defaultCostExplorerItems);
    this.selectedGlobalTeam.set('All');

    this.showToast('Dados Restaurados', 'O ambiente foi restaurado com os dados de demonstração originais.', 'info');
  }

  // --- STORAGE HELPERS ---
  private loadFromStorage<T>(key: string, defaultVal: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return defaultVal;
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }

  // --- RICH DEFAULT TEAMS MOCK DATA ---
  private get defaultTeams(): Team[] {
    return [
      {
        id: 'team-dev',
        name: 'Time de Desenvolvimento (Core Eng)',
        slug: 'core-development',
        costCenter: 'CC-ENG-101',
        leader: 'Lucas Albuquerque (Tech Lead)',
        contactEmail: 'dev-lead@empresa.io',
        slackChannel: '#squad-core-dev',
        allocatedMonthlyBudget: 32000,
        currentMonthlySpend: 25170,
        memberCount: 18,
        tags: ['Backend', 'Frontend', 'Mobile', 'Production'],
        description: 'Responsável pelos microsserviços core de checkout, pagamentos, catálogo e API Gateway.',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
      {
        id: 'team-support',
        name: 'Time de Suporte & Ops (Customer Eng)',
        slug: 'customer-support-ops',
        costCenter: 'CC-OPS-202',
        leader: 'Mariana Rios (Ops Lead)',
        contactEmail: 'support-ops@empresa.io',
        slackChannel: '#ops-support-tier3',
        allocatedMonthlyBudget: 9000,
        currentMonthlySpend: 7460,
        memberCount: 14,
        tags: ['Support', 'CustomerOps', 'Zendesk-Bridge', 'Egress'],
        description: 'Responsável pela infraestrutura de atendimento, ingestão de chamados, chat ao vivo e tráfego de dados com clientes.',
        createdAt: '2026-08-10T00:00:00.000Z',
      },
      {
        id: 'team-data',
        name: 'Time de Dados & IA (Data Platform)',
        slug: 'data-ai-platform',
        costCenter: 'CC-DATA-303',
        leader: 'Rodrigo Takahashi (Head of Data)',
        contactEmail: 'data-eng@empresa.io',
        slackChannel: '#data-cost-governance',
        allocatedMonthlyBudget: 18000,
        currentMonthlySpend: 15210,
        memberCount: 9,
        tags: ['BigData', 'BigQuery', 'Analytics', 'ML-Inference'],
        description: 'Plataforma corporativa de dados, data lake, pipelines de ingestão Dataproc e modelos preditivos de machine learning.',
        createdAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'team-sre',
        name: 'Time de SRE, Segurança & Infraestrutura',
        slug: 'sre-cloud-infra',
        costCenter: 'CC-SRE-404',
        leader: 'Fernanda Lima (Principal SRE)',
        contactEmail: 'sre-team@empresa.io',
        slackChannel: '#sre-cloud-alerts',
        allocatedMonthlyBudget: 12000,
        currentMonthlySpend: 11250,
        memberCount: 6,
        tags: ['Kubernetes', 'Terraform', 'Security', 'Compliance'],
        description: 'Gestão dos clusters Kubernetes, conectividade multi-cloud, malha de serviços, segurança de perímetro e observability.',
        createdAt: '2026-09-15T00:00:00.000Z',
      },
    ];
  }

  // --- DEFAULT BUDGETS ---
  private get defaultBudgets(): Budget[] {
    return [
      {
        id: 'bdg-01',
        name: 'Infraestrutura Global Multi-Cloud',
        provider: 'All',
        amount: 65000,
        currentSpend: 53290,
        period: 'Monthly',
        alertThresholdPercent: 80,
        notificationEmail: 'finops-team@enterprise.io',
        notificationSlackChannel: '#alerts-cloud-costs',
        tags: ['Production', 'Executive', 'Core'],
        teamId: 'team-sre',
        teamName: 'Time de SRE, Segurança & Infraestrutura',
        description: 'Teto operacional global para faturas consolidadas de AWS, GCP e Azure.',
        createdAt: '2026-11-01T00:00:00.000Z',
      },
      {
        id: 'bdg-02',
        name: 'AWS Cluster EKS & Bancos Aurora (Core Dev)',
        provider: 'AWS',
        amount: 32000,
        currentSpend: 24850,
        period: 'Monthly',
        alertThresholdPercent: 85,
        notificationEmail: 'infra-aws@enterprise.io',
        notificationSlackChannel: '#aws-infra-ops',
        tags: ['AWS', 'Containers', 'Production'],
        teamId: 'team-dev',
        teamName: 'Time de Desenvolvimento (Core Eng)',
        description: 'Instâncias c6i/m6i, volumes gp3 e clusters Aurora Multi-AZ.',
        createdAt: '2026-11-01T00:00:00.000Z',
      },
      {
        id: 'bdg-03',
        name: 'GCP BigQuery & Data Platform Analytics',
        provider: 'GCP',
        amount: 14000,
        currentSpend: 15210,
        period: 'Monthly',
        alertThresholdPercent: 90,
        notificationEmail: 'data-eng@enterprise.io',
        notificationSlackChannel: '#data-cost-governance',
        tags: ['BigData', 'Analytics', 'DataEng'],
        teamId: 'team-data',
        teamName: 'Time de Dados & IA (Data Platform)',
        description: 'Orçamento de consultas sob demanda do BigQuery e clusters Dataproc.',
        createdAt: '2026-11-01T00:00:00.000Z',
      },
      {
        id: 'bdg-04',
        name: 'Kubernetes Workloads & Microserviços',
        provider: 'Kubernetes',
        amount: 12000,
        currentSpend: 8430,
        period: 'Monthly',
        alertThresholdPercent: 75,
        notificationEmail: 'sre-k8s@enterprise.io',
        notificationSlackChannel: '#k8s-cost-alerts',
        tags: ['Kubecost', 'Pods', 'Namespaces'],
        teamId: 'team-sre',
        teamName: 'Time de SRE, Segurança & Infraestrutura',
        description: 'Alocação de nós de computação para microsserviços de pagamento e login.',
        createdAt: '2026-11-01T00:00:00.000Z',
      },
      {
        id: 'bdg-05',
        name: 'Atendimento & Egress do Time de Suporte',
        provider: 'AWS',
        amount: 9000,
        currentSpend: 7460,
        period: 'Monthly',
        alertThresholdPercent: 80,
        notificationEmail: 'support-ops@empresa.io',
        notificationSlackChannel: '#ops-support-tier3',
        tags: ['Support', 'CustomerOps', 'Zendesk'],
        teamId: 'team-support',
        teamName: 'Time de Suporte & Ops (Customer Eng)',
        description: 'Transferência de dados e instâncias dedicadas aos fluxos de suporte e chamados.',
        createdAt: '2026-11-01T00:00:00.000Z',
      },
    ];
  }

  // --- DEFAULT RECOMMENDATIONS ---
  private get defaultRecommendations(): SavingsRecommendation[] {
    return [
      {
        id: 'rec-01',
        title: 'Downsizing de instâncias c5.4xlarge ociosas (CPU média < 4%)',
        service: 'Amazon EC2',
        provider: 'AWS',
        category: 'Rightsizing',
        currentCostMonthly: 2180,
        projectedCostMonthly: 720,
        estimatedSavingsMonthly: 1460,
        effort: 'Low',
        risk: 'Low',
        status: 'Open',
        description: '3 instâncias c5.4xlarge no pool de background jobs estão com utilização de CPU inferior a 4% há mais de 21 dias. Recomenda-se migrar para c6i.xlarge.',
        resourceId: 'i-08a94bc72019fab01',
        teamId: 'team-dev',
        teamName: 'Time de Desenvolvimento (Core Eng)',
        createdAt: '2026-11-10T14:30:00.000Z',
      },
      {
        id: 'rec-02',
        title: 'Exclusão de 14 volumes gp2 EBS órfãos (desanexados)',
        service: 'Amazon EBS',
        provider: 'AWS',
        category: 'Idle Resource',
        currentCostMonthly: 640,
        projectedCostMonthly: 0,
        estimatedSavingsMonthly: 640,
        effort: 'Low',
        risk: 'Low',
        status: 'Open',
        description: 'Volumes de blocos remanescentes de rotinas de CI/CD destruídas sem flag deleteOnTermination. Gerar snapshot e purgar volumes.',
        resourceId: 'vol-03ef490812aa64b9',
        teamId: 'team-sre',
        teamName: 'Time de SRE, Segurança & Infraestrutura',
        createdAt: '2026-11-12T09:15:00.000Z',
      },
      {
        id: 'rec-03',
        title: 'Migração de volumes de armazenamento gp2 para gp3',
        service: 'Amazon EBS',
        provider: 'AWS',
        category: 'Storage Optimization',
        currentCostMonthly: 4120,
        projectedCostMonthly: 3296,
        estimatedSavingsMonthly: 824,
        effort: 'Medium',
        risk: 'Low',
        status: 'In Review',
        description: 'Volumes gp3 oferecem baseline de 3.000 IOPS e 125 MB/s sem custo extra, com custo 20% menor por GB alocado em comparação com o legado gp2.',
        resourceId: 'fleet-ebs-storage-prod',
        teamId: 'team-dev',
        teamName: 'Time de Desenvolvimento (Core Eng)',
        createdAt: '2026-11-14T11:00:00.000Z',
      },
      {
        id: 'rec-04',
        title: 'Contratação de Compute Savings Plans de 1 ano com adiantamento parcial',
        service: 'AWS Compute Platform',
        provider: 'AWS',
        category: 'Reserved Instance',
        currentCostMonthly: 12400,
        projectedCostMonthly: 8680,
        estimatedSavingsMonthly: 3720,
        effort: 'Low',
        risk: 'Medium',
        status: 'In Review',
        description: 'O consumo baseline estável de instâncias EC2 e Fargate cobre 78% do footprint contínuo dos últimos 6 meses. O plano garante desconto médio de 30%.',
        resourceId: 'sp-commitment-eval-2026',
        teamId: 'team-sre',
        teamName: 'Time de SRE, Segurança & Infraestrutura',
        createdAt: '2026-11-15T16:45:00.000Z',
      },
      {
        id: 'rec-05',
        title: 'Otimização de rotinas de download do portal do Suporte (Cache CDN)',
        service: 'Amazon S3 / CloudFront',
        provider: 'AWS',
        category: 'Idle Resource',
        currentCostMonthly: 1420,
        projectedCostMonthly: 480,
        estimatedSavingsMonthly: 940,
        effort: 'Medium',
        risk: 'Low',
        status: 'Open',
        description: 'Inserção de cabeçalhos Cache-Control adequados nos anexos de tickets de atendimento para evitar downloads diretos repetidos no bucket S3.',
        resourceId: 's3-support-attachments',
        teamId: 'team-support',
        teamName: 'Time de Suporte & Ops (Customer Eng)',
        createdAt: '2026-11-16T10:00:00.000Z',
      },
      {
        id: 'rec-06',
        title: 'Particionamento e Clustering em tabelas de auditoria do BigQuery',
        service: 'Google BigQuery',
        provider: 'GCP',
        category: 'Architectural',
        currentCostMonthly: 3400,
        projectedCostMonthly: 1800,
        estimatedSavingsMonthly: 1600,
        effort: 'Medium',
        risk: 'Low',
        status: 'Applied',
        appliedAt: '2026-11-17T18:20:00.000Z',
        description: 'Particionar por ingest_date e clusterizar por client_id reduz em 55% a quantidade de bytes escaneados pelas consultas diárias de analytics.',
        resourceId: 'gcp-bq-audit-logs',
        teamId: 'team-data',
        teamName: 'Time de Dados & IA (Data Platform)',
        createdAt: '2026-11-08T10:00:00.000Z',
      },
    ];
  }

  // --- DEFAULT ACCOUNTS ---
  private get defaultAccounts(): CloudAccount[] {
    return [
      {
        id: 'acc-01',
        name: 'AWS Core Enterprise (Master Payer)',
        provider: 'AWS',
        accountId: '8492-1049-5821',
        environment: 'Production',
        monthlySpend: 28450,
        syncStatus: 'Synced',
        lastSyncedAt: 'Hoje às 09:42',
        arnOrKey: 'arn:aws:iam::849210495821:role/ZenithFinOpsObservabilityRole',
        regionDefault: 'us-east-1',
        createdAt: '2026-08-15T00:00:00.000Z',
      },
      {
        id: 'acc-02',
        name: 'GCP Global Data Platform & Analytics',
        provider: 'GCP',
        accountId: 'gcp-prod-analytics-8812',
        environment: 'Production',
        monthlySpend: 14210,
        syncStatus: 'Synced',
        lastSyncedAt: 'Hoje às 09:30',
        arnOrKey: 'finops-telemetry@gcp-prod-analytics-8812.iam.gserviceaccount.com',
        regionDefault: 'us-central1',
        createdAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'acc-03',
        name: 'Azure Corporate Hub & Hybrid Cloud',
        provider: 'Azure',
        accountId: 'az-sub-77890-prod-corp',
        environment: 'Production',
        monthlySpend: 7890,
        syncStatus: 'Synced',
        lastSyncedAt: 'Hoje às 08:55',
        arnOrKey: 'tenant-4b89-a291-corp-active-directory',
        regionDefault: 'eastus2',
        createdAt: '2026-09-20T00:00:00.000Z',
      },
      {
        id: 'acc-04',
        name: 'Kubernetes Production Clusters Fleet',
        provider: 'Kubernetes',
        accountId: 'k8s-prod-cluster-east-01',
        environment: 'Production',
        monthlySpend: 5420,
        syncStatus: 'Synced',
        lastSyncedAt: 'Hoje às 09:40',
        arnOrKey: 'agent-v2.14.0-k8s-cost-exporter',
        regionDefault: 'us-east-1',
        createdAt: '2026-10-05T00:00:00.000Z',
      },
      {
        id: 'acc-05',
        name: 'AWS Staging & Sandboxes Playground',
        provider: 'AWS',
        accountId: '3910-4829-1940',
        environment: 'Staging',
        monthlySpend: 3120,
        syncStatus: 'Synced',
        lastSyncedAt: 'Hoje às 07:15',
        arnOrKey: 'arn:aws:iam::391048291940:role/ZenithNonProdRole',
        regionDefault: 'sa-east-1',
        createdAt: '2026-10-12T00:00:00.000Z',
      },
    ];
  }

  // --- DEFAULT ANOMALIES ---
  private get defaultAnomalies(): CostAnomaly[] {
    return [
      {
        id: 'anm-01',
        service: 'Amazon S3 & CloudFront Data Transfer',
        provider: 'AWS',
        detectedAt: 'Ontem às 22:15',
        normalSpend: 160,
        anomalySpend: 1420,
        percentageSpike: 787,
        rootCause:
          'Transferência de dados externa (Data Egress) multiplicada após alteração no script de backup diário que realizou download cruzado de imagens sem cache em CDN.',
        status: 'Investigating',
        severity: 'Critical',
        teamName: 'Time de Suporte & Ops (Customer Eng)',
      },
      {
        id: 'anm-02',
        service: 'Google BigQuery Analysis (On-Demand)',
        provider: 'GCP',
        detectedAt: 'Há 2 dias',
        normalSpend: 45,
        anomalySpend: 520,
        percentageSpike: 1055,
        rootCause:
          'Consulta não particionada em tabela analítica de 4.8 TB executada repetidamente a cada 5 minutos por um cron job em ambiente de testes.',
        status: 'Investigating',
        severity: 'Critical',
        teamName: 'Time de Dados & IA (Data Platform)',
      },
      {
        id: 'anm-03',
        service: 'AWS Lambda Executions & Concurrency',
        provider: 'AWS',
        detectedAt: 'Há 4 dias',
        normalSpend: 80,
        anomalySpend: 390,
        percentageSpike: 387,
        rootCause:
          'Loop recursivo entre SNS e trigger de Lambda processando payloads malformatados com retry infinito.',
        status: 'Resolved',
        severity: 'Warning',
        teamName: 'Time de Desenvolvimento (Core Eng)',
      },
    ];
  }

  // --- DEFAULT COST EXPLORER ITEMS COM ASSOCIAÇÃO DE TIME ---
  private get defaultCostExplorerItems(): CostExplorerItem[] {
    return [
      {
        id: 'ce-01',
        service: 'Amazon EC2 (Compute Instances)',
        provider: 'AWS',
        environment: 'Production',
        region: 'us-east-1',
        teamId: 'team-dev',
        teamName: 'Time de Desenvolvimento (Core Eng)',
        cost: 14850,
        previousCost: 14200,
        trendPercentage: 4.5,
        usageUnit: 'Instance-Hours',
        usageQuantity: 28400,
        date: 'Nov 2026',
      },
      {
        id: 'ce-02',
        service: 'Amazon Relational Database (Aurora Multi-AZ)',
        provider: 'AWS',
        environment: 'Production',
        region: 'us-east-1',
        teamId: 'team-dev',
        teamName: 'Time de Desenvolvimento (Core Eng)',
        cost: 7200,
        previousCost: 6980,
        trendPercentage: 3.1,
        usageUnit: 'ACU-Hours',
        usageQuantity: 12900,
        date: 'Nov 2026',
      },
      {
        id: 'ce-03',
        service: 'Google BigQuery (Storage & Compute)',
        provider: 'GCP',
        environment: 'Production',
        region: 'us-central1',
        teamId: 'team-data',
        teamName: 'Time de Dados & IA (Data Platform)',
        cost: 8400,
        previousCost: 7100,
        trendPercentage: 18.3,
        usageUnit: 'TB Scanned',
        usageQuantity: 1680,
        date: 'Nov 2026',
      },
      {
        id: 'ce-04',
        service: 'Google Kubernetes Engine (GKE Autopilot)',
        provider: 'GCP',
        environment: 'Production',
        region: 'us-central1',
        teamId: 'team-data',
        teamName: 'Time de Dados & IA (Data Platform)',
        cost: 5810,
        previousCost: 5900,
        trendPercentage: -1.5,
        usageUnit: 'vCPU / Memory-Hours',
        usageQuantity: 41200,
        date: 'Nov 2026',
      },
      {
        id: 'ce-05',
        service: 'Azure App Service & Container Apps',
        provider: 'Azure',
        environment: 'Production',
        region: 'eastus2',
        teamId: 'team-support',
        teamName: 'Time de Suporte & Ops (Customer Eng)',
        cost: 4950,
        previousCost: 4800,
        trendPercentage: 3.1,
        usageUnit: 'Core-Hours',
        usageQuantity: 18200,
        date: 'Nov 2026',
      },
      {
        id: 'ce-06',
        service: 'Amazon Elastic Block Store (EBS gp3)',
        provider: 'AWS',
        environment: 'Production',
        region: 'us-east-1',
        teamId: 'team-dev',
        teamName: 'Time de Desenvolvimento (Core Eng)',
        cost: 3890,
        previousCost: 4050,
        trendPercentage: -3.9,
        usageUnit: 'GB-Mo',
        usageQuantity: 48600,
        date: 'Nov 2026',
      },
      {
        id: 'ce-07',
        service: 'Amazon Simple Storage Service (S3 Support & Egress)',
        provider: 'AWS',
        environment: 'Production',
        region: 'us-east-1',
        teamId: 'team-support',
        teamName: 'Time de Suporte & Ops (Customer Eng)',
        cost: 2510,
        previousCost: 1980,
        trendPercentage: 26.7,
        usageUnit: 'GB-Mo / Egress',
        usageQuantity: 98000,
        date: 'Nov 2026',
      },
      {
        id: 'ce-08',
        service: 'Azure SQL Database Hyperscale',
        provider: 'Azure',
        environment: 'Production',
        region: 'eastus2',
        teamId: 'team-dev',
        teamName: 'Time de Desenvolvimento (Core Eng)',
        cost: 2940,
        previousCost: 2900,
        trendPercentage: 1.4,
        usageUnit: 'vCore-Hours',
        usageQuantity: 8400,
        date: 'Nov 2026',
      },
      {
        id: 'ce-09',
        service: 'Kubernetes Node Pool (K8s Ingress & Workers)',
        provider: 'Kubernetes',
        environment: 'Production',
        region: 'us-east-1',
        teamId: 'team-sre',
        teamName: 'Time de SRE, Segurança & Infraestrutura',
        cost: 5420,
        previousCost: 5600,
        trendPercentage: -3.2,
        usageUnit: 'Node-Hours',
        usageQuantity: 4320,
        date: 'Nov 2026',
      },
      {
        id: 'ce-10',
        service: 'AWS Staging Playground (Sandbox & Tests)',
        provider: 'AWS',
        environment: 'Staging',
        region: 'sa-east-1',
        teamId: 'team-dev',
        teamName: 'Time de Desenvolvimento (Core Eng)',
        cost: 3120,
        previousCost: 3250,
        trendPercentage: -4.0,
        usageUnit: 'Various Hours',
        usageQuantity: 6200,
        date: 'Nov 2026',
      },
    ];
  }
}
