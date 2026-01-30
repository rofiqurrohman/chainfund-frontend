import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Types
export interface Funding {
  id: string;
  userId: string;
  name: string;
  description: string;
  industry: string;
  location: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  fundingTarget: number;
  currentFunding: number;
  minimumInvestment: number;
  roiPercentage: number;
  durationMonths: number;
  startDate: string;
  endDate: string;
  remainingDays: number;
  imageUrl: string;
  isActive: boolean;
  isFunded: boolean;
  contractAddress: string | null;
  financialDetails: {
    monthlyRevenue: number;
    monthlyExpenses: number;
    netProfit: number;
    profitMargin: number;
    businessAge: number;
  };
  updates?: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
  }>;
}

export interface Investment {
  id: string;
  fundingId: string;
  projectName: string;
  amount: number;
  status: "LOCKED" | "RUNNING" | "PROFIT_GENERATING" | "COMPLETED" | "FAILED";
  expectedReturn: number;
  actualReturn: number | null;
  investedAt: string;
  completedAt: string | null;
}

export interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "INVESTMENT" | "PROFIT" | "REFUND";
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  txHash?: string;
  description?: string;
  timestamp: string;
}

export interface DashboardStats {
  totalValue: number;
  totalInvested: number;
  totalEarnings: number;
  activeInvestments: number;
  completedInvestments: number;
  averageROI: number;
}

export interface EarningsData {
  month: string;
  earnings: number;
  invested: number;
}

export interface WalletStats {
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  pendingTransactions: number;
}

// API client class
class ApiClient {
  private getToken: (() => Promise<string | null>) | null = null;

  setTokenGetter(getter: () => Promise<string | null>) {
    this.getToken = getter;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add auth token if available
    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || `HTTP error ${response.status}`);
    }

    return response.json();
  }

  // Fundings (Public)
  async getFundings(params?: {
    page?: number;
    limit?: number;
    industry?: string;
    riskLevel?: string;
    search?: string;
  }): Promise<{
    fundings: Funding[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.industry) searchParams.set("industry", params.industry);
    if (params?.riskLevel) searchParams.set("riskLevel", params.riskLevel);
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    return this.request(`/api/fundings${query ? `?${query}` : ""}`);
  }

  async getFunding(id: string): Promise<{ funding: Funding }> {
    return this.request(`/api/fundings/${id}`);
  }

  // Fundings (Authenticated)
  async getMyFundings(): Promise<{ fundings: Funding[] }> {
    return this.request("/api/fundings/my/list");
  }

  async createFunding(data: Partial<Funding>): Promise<{ funding: Funding }> {
    return this.request("/api/fundings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateFunding(
    id: string,
    data: Partial<Funding>,
  ): Promise<{ funding: Funding }> {
    return this.request(`/api/fundings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteFunding(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/fundings/${id}`, {
      method: "DELETE",
    });
  }

  async updateFundingContract(
    id: string,
    contractAddress: string,
  ): Promise<{ funding: Funding }> {
    return this.request(`/api/fundings/${id}/contract`, {
      method: "PUT",
      body: JSON.stringify({ contractAddress }),
    });
  }

  // Investments
  async getInvestments(): Promise<{ investments: Investment[] }> {
    return this.request("/api/investments");
  }

  async getInvestment(id: string): Promise<{ investment: Investment }> {
    return this.request(`/api/investments/${id}`);
  }

  async createInvestment(data: {
    fundingId: string;
    amount: number;
    txHash?: string;
  }): Promise<{ investment: Investment }> {
    return this.request("/api/investments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Dashboard
  async getDashboardStats(): Promise<{ stats: DashboardStats }> {
    return this.request("/api/dashboard/stats");
  }

  async getEarningsData(): Promise<{ earnings: EarningsData[] }> {
    return this.request("/api/dashboard/earnings");
  }

  async getTransactions(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ transactions: Transaction[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return this.request(
      `/api/dashboard/transactions${query ? `?${query}` : ""}`,
    );
  }

  async getWalletStats(): Promise<{ wallet: WalletStats }> {
    return this.request("/api/dashboard/wallet");
  }

  // User
  async updateProfile(data: {
    name?: string;
    avatarUrl?: string;
  }): Promise<{ user: unknown }> {
    return this.request("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();

// Hook to initialize API with auth token
export function useApiAuth() {
  const { getAccessToken } = useAuth();

  // Set token getter on API client
  api.setTokenGetter(getAccessToken);

  return api;
}
