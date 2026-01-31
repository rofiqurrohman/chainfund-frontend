// ===== Risk Level =====
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

// ===== Investment Status =====
export type InvestmentStatus = 'LOCKED' | 'RUNNING' | 'PROFIT_GENERATING' | 'COMPLETED' | 'FAILED';

// ===== Industry Type =====
export type Industry =
  | 'F&B'
  | 'Retail'
  | 'Agriculture'
  | 'Technology'
  | 'Manufacturing'
  | 'Services'
  | 'Healthcare'
  | 'Education';

// ===== Project =====
export interface Project {
  id: string;
  name: string;
  description: string;
  industry: Industry;
  location: string;
  riskLevel: RiskLevel;
  fundingTarget: number; // in IDRX
  currentFunding: number; // in IDRX
  minimumInvestment: number; // in IDRX
  roiPercentage: number;
  durationMonths: number;
  startDate: string;
  endDate: string;
  remainingDays: number;
  imageUrl: string;
  isActive: boolean;
  isFunded: boolean;
  updates: ProjectUpdate[];
  financialDetails: FinancialDetails;
  contractAddress?: `0x${string}`; // Smart contract address for blockchain campaigns
}

export interface ProjectUpdate {
  id: string;
  date: string;
  title: string;
  content: string;
}

export interface FinancialDetails {
  monthlyRevenue: number;
  monthlyExpenses: number;
  netProfit: number;
  profitMargin: number;
  businessAge: number; // in months
}

// ===== Investment =====
export interface Investment {
  id: string;
  projectId: string;
  projectName: string;
  amount: number; // in IDRX
  status: InvestmentStatus;
  investedAt: string;
  expectedReturn: number;
  actualReturn?: number;
  completedAt?: string;
}

// ===== User =====
export interface User {
  address: string;
  balance: number; // IDRX balance
  totalInvested: number;
  totalEarnings: number;
  investments: Investment[];
}

// ===== Transaction =====
export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT' | 'PROFIT' | 'REFUND';
  amount: number;
  timestamp: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  txHash?: string;
}

// ===== Wallet Stats =====
export interface WalletStats {
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  pendingTransactions: number;
}

// ===== Portfolio Stats =====
export interface PortfolioStats {
  totalValue: number;
  totalInvested: number;
  totalEarnings: number;
  activeInvestments: number;
  completedInvestments: number;
  averageROI: number;
}

// ===== Chart Data =====
export interface EarningsData {
  month: string;
  earnings: number;
  invested: number;
}
