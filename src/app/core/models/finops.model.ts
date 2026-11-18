export type CloudProvider = 'AWS' | 'GCP' | 'Azure' | 'Kubernetes';

export type Environment = 'Production' | 'Staging' | 'Development' | 'Shared';

export interface Team {
  id: string;
  name: string;
  slug: string;
  costCenter: string; // ex: 'CC-ENG-101'
  leader: string;
  contactEmail: string;
  slackChannel: string;
  allocatedMonthlyBudget: number;
  currentMonthlySpend: number;
  memberCount: number;
  tags: string[];
  description: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  name: string;
  provider: CloudProvider | 'All';
  amount: number;
  currentSpend: number;
  period: 'Monthly' | 'Quarterly' | 'Annual';
  alertThresholdPercent: number; // e.g. 80
  notificationEmail: string;
  notificationSlackChannel: string;
  tags: string[];
  teamId?: string;
  teamName?: string;
  description?: string;
  createdAt: string;
}

export type RecommendationCategory =
  | 'Rightsizing'
  | 'Idle Resource'
  | 'Reserved Instance'
  | 'Storage Optimization'
  | 'Architectural';

export interface SavingsRecommendation {
  id: string;
  title: string;
  service: string;
  provider: CloudProvider;
  category: RecommendationCategory;
  currentCostMonthly: number;
  projectedCostMonthly: number;
  estimatedSavingsMonthly: number;
  effort: 'Low' | 'Medium' | 'High';
  risk: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Review' | 'Applied' | 'Dismissed';
  description: string;
  resourceId: string;
  teamId?: string;
  teamName?: string;
  appliedAt?: string;
  createdAt: string;
}

export interface CloudAccount {
  id: string;
  name: string;
  provider: CloudProvider;
  accountId: string;
  environment: Environment;
  monthlySpend: number;
  syncStatus: 'Synced' | 'Syncing' | 'Error';
  lastSyncedAt: string;
  arnOrKey: string;
  regionDefault: string;
  createdAt: string;
}

export interface CostAnomaly {
  id: string;
  service: string;
  provider: CloudProvider;
  detectedAt: string;
  normalSpend: number;
  anomalySpend: number;
  percentageSpike: number;
  rootCause: string;
  status: 'Investigating' | 'Resolved' | 'False Positive';
  severity: 'Critical' | 'Warning' | 'Info';
  teamName?: string;
}

export interface CostExplorerItem {
  id: string;
  service: string;
  provider: CloudProvider;
  environment: Environment;
  region: string;
  teamId: string;
  teamName: string;
  cost: number;
  previousCost: number;
  trendPercentage: number;
  usageUnit: string;
  usageQuantity: number;
  date: string;
}

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface DailySpendPoint {
  day: string;
  spend: number;
  forecast?: number;
}
