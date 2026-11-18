import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { FinOpsDataService } from './core/services/finops-data.service';

describe('Zenith FinOps Platform - Testes Rigorosos (Processo 3)', () => {
  let service: FinOpsDataService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [FinOpsDataService],
    }).compileComponents();

    service = TestBed.inject(FinOpsDataService);
  });

  describe('Componente Raiz (App)', () => {
    it('deve inicializar a aplicação com sucesso', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      expect(app).toBeTruthy();
    });

    it('deve conter os 7 módulos de FinOps mapeados na navegação (incluindo Gestão por Times)', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      expect(app.navItems.length).toBe(7);
      expect(app.navItems.map((n) => n.id)).toEqual([
        'overview',
        'teams',
        'cost-explorer',
        'budgets',
        'recommendations',
        'accounts',
        'anomalies',
      ]);
    });

    it('deve renderizar o cabeçalho e a marca ZENITH', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.brand-logo')?.textContent).toContain('ZENITH');
    });
  });

  describe('Serviço de Dados & Regras de FinOps (FinOpsDataService)', () => {
    it('deve carregar dados ricos de demonstração por padrão com times incluídos', () => {
      expect(service.teams().length).toBeGreaterThan(0);
      expect(service.budgets().length).toBeGreaterThan(0);
      expect(service.accounts().length).toBeGreaterThan(0);
      expect(service.recommendations().length).toBeGreaterThan(0);
      expect(service.anomalies().length).toBeGreaterThan(0);
    });

    it('deve calcular o spend total MTD somando as contas de nuvem ativas', () => {
      const totalAccountsSpend = service
        .accounts()
        .reduce((acc, a) => acc + a.monthlySpend, 0);
      expect(service.totalSpendMTD()).toBe(totalAccountsSpend);
    });

    it('deve calcular a métrica de Unit Economics (custo médio por integrante)', () => {
      expect(service.totalEngineersAndMembers()).toBeGreaterThan(0);
      expect(service.averageCostPerMember()).toBeGreaterThan(0);
    });

    it('deve alternar o tema entre dark e light', () => {
      const initial = service.theme();
      service.toggleTheme();
      expect(service.theme()).not.toBe(initial);
      service.toggleTheme();
      expect(service.theme()).toBe(initial);
    });
  });

  describe('CRUD de Gestão por Times (Teams & Chargeback)', () => {
    it('deve criar um novo time e persistir na lista', () => {
      const initialCount = service.teams().length;
      service.createTeam({
        name: 'Time de Testes Automatizados QA',
        slug: 'qa-automated-squad',
        costCenter: 'CC-QA-999',
        leader: 'Roberto QA Lead',
        contactEmail: 'qa-lead@empresa.io',
        slackChannel: '#qa-squad',
        allocatedMonthlyBudget: 12000,
        currentMonthlySpend: 4500,
        memberCount: 5,
        tags: ['QA', 'E2E', 'Testing'],
        description: 'Time responsável por automação de testes e infra de CI/CD.',
      });

      expect(service.teams().length).toBe(initialCount + 1);
      const created = service.teams().find((t) => t.costCenter === 'CC-QA-999');
      expect(created).toBeTruthy();
      expect(created?.name).toBe('Time de Testes Automatizados QA');
    });

    it('deve atualizar dados e orçamento de um time existente', () => {
      const first = service.teams()[0];
      service.updateTeam(first.id, {
        allocatedMonthlyBudget: 55000,
        memberCount: 22,
      });

      const updated = service.teams().find((t) => t.id === first.id);
      expect(updated?.allocatedMonthlyBudget).toBe(55000);
      expect(updated?.memberCount).toBe(22);
    });

    it('deve excluir um time da lista com segurança', () => {
      const first = service.teams()[0];
      const initialCount = service.teams().length;
      service.deleteTeam(first.id);

      expect(service.teams().length).toBe(initialCount - 1);
      expect(service.teams().some((t) => t.id === first.id)).toBe(false);
    });

    it('deve aplicar o filtro global de time', () => {
      const first = service.teams()[0];
      service.setGlobalTeam(first.id);
      expect(service.selectedGlobalTeam()).toBe(first.id);

      service.setGlobalTeam('All');
      expect(service.selectedGlobalTeam()).toBe('All');
    });
  });

  describe('CRUD de Orçamentos (Budgets)', () => {
    it('deve criar um novo orçamento e persistir na lista', () => {
      const initialCount = service.budgets().length;
      service.createBudget({
        name: 'Teste de Orçamento Automatizado',
        provider: 'AWS',
        amount: 20000,
        currentSpend: 5000,
        period: 'Monthly',
        alertThresholdPercent: 80,
        notificationEmail: 'qa@empresa.io',
        notificationSlackChannel: '#qa-finops',
        tags: ['QA', 'AutomatedTest'],
      });

      expect(service.budgets().length).toBe(initialCount + 1);
      const created = service.budgets().find((b) => b.name === 'Teste de Orçamento Automatizado');
      expect(created).toBeTruthy();
      expect(created?.amount).toBe(20000);
    });

    it('deve atualizar o teto e limiares de um orçamento existente', () => {
      const first = service.budgets()[0];
      service.updateBudget(first.id, {
        amount: 99999,
        alertThresholdPercent: 90,
      });

      const updated = service.budgets().find((b) => b.id === first.id);
      expect(updated?.amount).toBe(99999);
      expect(updated?.alertThresholdPercent).toBe(90);
    });

    it('deve excluir um orçamento da lista', () => {
      const first = service.budgets()[0];
      const initialCount = service.budgets().length;
      service.deleteBudget(first.id);

      expect(service.budgets().length).toBe(initialCount - 1);
      expect(service.budgets().some((b) => b.id === first.id)).toBe(false);
    });
  });

  describe('CRUD de Recomendações & Economia (Rightsizing)', () => {
    it('deve adicionar nova recomendação personalizada de economia', () => {
      const initialCount = service.recommendations().length;
      service.createRecommendation({
        title: 'Desligar clusters EMR fora de horário',
        service: 'Amazon EMR',
        provider: 'AWS',
        category: 'Idle Resource',
        currentCostMonthly: 3000,
        projectedCostMonthly: 1000,
        estimatedSavingsMonthly: 2000,
        effort: 'Low',
        risk: 'Low',
        status: 'Open',
        description: 'Desligamento automatizado via Lambda cron job.',
        resourceId: 'j-09124801b9',
      });

      expect(service.recommendations().length).toBe(initialCount + 1);
    });

    it('deve aplicar uma otimização e refletir na economia realizada', () => {
      const openItem = service.recommendations().find((r) => r.status === 'Open');
      expect(openItem).toBeTruthy();
      if (!openItem) return;

      const previousRealized = service.realizedSavings();
      service.applyRecommendation(openItem.id);

      const updated = service.recommendations().find((r) => r.id === openItem.id);
      expect(updated?.status).toBe('Applied');
      expect(service.realizedSavings()).toBe(previousRealized + openItem.estimatedSavingsMonthly);
    });

    it('deve remover/descartar uma recomendação', () => {
      const target = service.recommendations()[0];
      const initialCount = service.recommendations().length;
      service.deleteRecommendation(target.id);
      expect(service.recommendations().length).toBe(initialCount - 1);
    });
  });

  describe('CRUD de Contas & Conexões de Nuvem (Accounts)', () => {
    it('deve conectar nova conta multi-cloud', () => {
      const initialCount = service.accounts().length;
      service.createAccount({
        name: 'GCP Staging AI Cluster',
        provider: 'GCP',
        accountId: 'gcp-project-staging-ai',
        environment: 'Staging',
        monthlySpend: 4200,
        arnOrKey: 'service-acc@gcp-project-staging-ai.iam.gserviceaccount.com',
        regionDefault: 'us-central1',
      });

      expect(service.accounts().length).toBe(initialCount + 1);
    });

    it('deve atualizar parâmetros de conta existente', () => {
      const target = service.accounts()[0];
      service.updateAccount(target.id, { name: 'Conta Renomeada Prod' });
      const updated = service.accounts().find((a) => a.id === target.id);
      expect(updated?.name).toBe('Conta Renomeada Prod');
    });

    it('deve desconectar conta de nuvem', () => {
      const target = service.accounts()[0];
      const initialCount = service.accounts().length;
      service.deleteAccount(target.id);
      expect(service.accounts().length).toBe(initialCount - 1);
    });
  });

  describe('Gestão de Anomalias', () => {
    it('deve atualizar o status de uma anomalia para Resolvido', () => {
      const anomaly = service.anomalies()[0];
      service.updateAnomalyStatus(anomaly.id, 'Resolved');
      const updated = service.anomalies().find((a) => a.id === anomaly.id);
      expect(updated?.status).toBe('Resolved');
    });
  });
});
