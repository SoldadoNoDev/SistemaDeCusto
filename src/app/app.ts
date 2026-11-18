import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinOpsDataService } from './core/services/finops-data.service';
import { IconComponent } from './shared/components/icon/icon.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CostExplorerComponent } from './features/cost-explorer/cost-explorer.component';
import { BudgetsComponent } from './features/budgets/budgets.component';
import { RecommendationsComponent } from './features/recommendations/recommendations.component';
import { AccountsComponent } from './features/accounts/accounts.component';
import { AnomaliesComponent } from './features/anomalies/anomalies.component';
import { TeamsComponent } from './features/teams/teams.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    ToastComponent,
    DashboardComponent,
    CostExplorerComponent,
    BudgetsComponent,
    RecommendationsComponent,
    AccountsComponent,
    AnomaliesComponent,
    TeamsComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly dataService = inject(FinOpsDataService);

  readonly navItems = [
    { id: 'overview', label: 'Visão Geral (Dashboard)', icon: 'dashboard', badge: '' },
    { id: 'teams', label: 'Gestão por Times', icon: 'users', badge: 'CRUD' },
    { id: 'cost-explorer', label: 'Cost Explorer & Showback', icon: 'chart', badge: '' },
    { id: 'budgets', label: 'Orçamentos & Alertas', icon: 'wallet', badge: 'CRUD' },
    { id: 'recommendations', label: 'Otimização & Rightsizing', icon: 'sparkles', badge: 'CRUD' },
    { id: 'accounts', label: 'Contas & Clusters', icon: 'cloud', badge: 'CRUD' },
    { id: 'anomalies', label: 'Central de Anomalias', icon: 'alert-triangle', badge: '' },
  ];
}
