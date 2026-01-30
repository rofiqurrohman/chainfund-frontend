import type {
  Project,
  Investment,
  User,
  EarningsData,
  Transaction,
} from "@/types";

// ===== Mock Projects =====
export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Warung Kopi Nusantara",
    description:
      "Ekspansi jaringan kedai kopi premium dengan fokus pada biji kopi lokal Nusantara. Target membuka 5 cabang baru di area Jabodetabek dalam 12 bulan.",
    industry: "F&B",
    location: "Jakarta",
    riskLevel: "LOW",
    fundingTarget: 500000000,
    currentFunding: 385000000,
    minimumInvestment: 1000000,
    roiPercentage: 15,
    durationMonths: 12,
    startDate: "2026-01-15",
    endDate: "2026-02-15",
    remainingDays: 35,
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
    isActive: true,
    isFunded: false,
    // Blockchain-enabled campaign - uses smart contract for investments
    contractAddress: "0x86dE4584E46c52A6f7bB910a924C419c9A5F346f",
    updates: [
      {
        id: "1",
        date: "2026-01-05",
        title: "Lokasi Cabang Pertama Dikonfirmasi",
        content:
          "Kami telah menandatangani kontrak sewa untuk lokasi pertama di Kemang, Jakarta Selatan.",
      },
    ],
    financialDetails: {
      monthlyRevenue: 150000000,
      monthlyExpenses: 95000000,
      netProfit: 55000000,
      profitMargin: 36.7,
      businessAge: 24,
    },
  },
  {
    id: "2",
    name: "TaniMaju Agritech",
    description:
      "Platform teknologi pertanian yang menghubungkan petani langsung dengan pembeli. Fokus pada hidroponik dan smart farming untuk hasil optimal.",
    industry: "Agriculture",
    location: "Bandung",
    riskLevel: "MEDIUM",
    fundingTarget: 750000000,
    currentFunding: 750000000,
    minimumInvestment: 2000000,
    roiPercentage: 18,
    durationMonths: 18,
    startDate: "2025-11-01",
    endDate: "2025-12-01",
    remainingDays: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800",
    isActive: true,
    isFunded: true,
    updates: [
      {
        id: "1",
        date: "2025-12-20",
        title: "Target Funding Tercapai!",
        content:
          "Terima kasih kepada semua investor. Proyek akan segera dimulai bulan depan.",
      },
    ],
    financialDetails: {
      monthlyRevenue: 200000000,
      monthlyExpenses: 140000000,
      netProfit: 60000000,
      profitMargin: 30,
      businessAge: 18,
    },
  },
  {
    id: "3",
    name: "Batik Digital Indonesia",
    description:
      "E-commerce batik dengan AR try-on feature. Memberdayakan pengrajin batik tradisional dengan akses pasar digital nasional dan internasional.",
    industry: "Retail",
    location: "Yogyakarta",
    riskLevel: "MEDIUM",
    fundingTarget: 300000000,
    currentFunding: 180000000,
    minimumInvestment: 500000,
    roiPercentage: 20,
    durationMonths: 12,
    startDate: "2026-01-20",
    endDate: "2026-02-20",
    remainingDays: 40,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    isActive: true,
    isFunded: false,
    updates: [],
    financialDetails: {
      monthlyRevenue: 80000000,
      monthlyExpenses: 55000000,
      netProfit: 25000000,
      profitMargin: 31.3,
      businessAge: 12,
    },
  },
  {
    id: "4",
    name: "EduKids Learning Center",
    description:
      "Franchise bimbingan belajar dengan metode interaktif dan teknologi gamifikasi. Ekspansi ke 10 lokasi baru di Jawa Timur.",
    industry: "Education",
    location: "Surabaya",
    riskLevel: "LOW",
    fundingTarget: 400000000,
    currentFunding: 320000000,
    minimumInvestment: 1000000,
    roiPercentage: 14,
    durationMonths: 24,
    startDate: "2026-02-01",
    endDate: "2026-03-01",
    remainingDays: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    isActive: true,
    isFunded: false,
    updates: [],
    financialDetails: {
      monthlyRevenue: 120000000,
      monthlyExpenses: 85000000,
      netProfit: 35000000,
      profitMargin: 29.2,
      businessAge: 36,
    },
  },
  {
    id: "5",
    name: "HealthTech Clinic",
    description:
      "Klinik kesehatan digital dengan telemedicine dan home care service. Integrasi AI untuk diagnosis awal dan manajemen kesehatan preventif.",
    industry: "Healthcare",
    location: "Jakarta",
    riskLevel: "HIGH",
    fundingTarget: 1000000000,
    currentFunding: 450000000,
    minimumInvestment: 5000000,
    roiPercentage: 25,
    durationMonths: 24,
    startDate: "2026-01-10",
    endDate: "2026-02-28",
    remainingDays: 48,
    imageUrl:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
    isActive: true,
    isFunded: false,
    updates: [],
    financialDetails: {
      monthlyRevenue: 350000000,
      monthlyExpenses: 250000000,
      netProfit: 100000000,
      profitMargin: 28.6,
      businessAge: 8,
    },
  },
  {
    id: "6",
    name: "CloudKitchen Nusantara",
    description:
      "Ghost kitchen dengan 15+ brand makanan Indonesia modern. Fokus pada delivery dan ekspansi ke 50 titik di seluruh Indonesia.",
    industry: "F&B",
    location: "Jakarta",
    riskLevel: "MEDIUM",
    fundingTarget: 600000000,
    currentFunding: 600000000,
    minimumInvestment: 1500000,
    roiPercentage: 22,
    durationMonths: 15,
    startDate: "2025-10-01",
    endDate: "2025-11-01",
    remainingDays: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
    isActive: true,
    isFunded: true,
    updates: [
      {
        id: "1",
        date: "2025-12-01",
        title: "Operasional Dimulai",
        content:
          "5 lokasi pertama sudah beroperasi dengan rata-rata 200 order per hari.",
      },
    ],
    financialDetails: {
      monthlyRevenue: 280000000,
      monthlyExpenses: 195000000,
      netProfit: 85000000,
      profitMargin: 30.4,
      businessAge: 14,
    },
  },
];

// ===== Mock User Investments =====
export const mockInvestments: Investment[] = [
  {
    id: "1",
    projectId: "2",
    projectName: "TaniMaju Agritech",
    amount: 10000000,
    status: "RUNNING",
    investedAt: "2025-11-15",
    expectedReturn: 11800000,
  },
  {
    id: "2",
    projectId: "6",
    projectName: "CloudKitchen Nusantara",
    amount: 15000000,
    status: "PROFIT_GENERATING",
    investedAt: "2025-10-20",
    expectedReturn: 18300000,
    actualReturn: 5500000, // partial profit received
  },
  {
    id: "3",
    projectId: "1",
    projectName: "Warung Kopi Nusantara",
    amount: 5000000,
    status: "LOCKED",
    investedAt: "2026-01-08",
    expectedReturn: 5750000,
  },
];

// ===== Mock User =====
export const mockUser: User = {
  address: "0x1234567890abcdef1234567890abcdef12345678",
  balance: 25000000,
  totalInvested: 30000000,
  totalEarnings: 5500000,
  investments: mockInvestments,
};

// ===== Mock Earnings Data =====
export const mockEarningsData: EarningsData[] = [
  { month: "Jul", earnings: 0, invested: 0 },
  { month: "Aug", earnings: 0, invested: 0 },
  { month: "Sep", earnings: 0, invested: 0 },
  { month: "Oct", earnings: 1200000, invested: 15000000 },
  { month: "Nov", earnings: 1800000, invested: 25000000 },
  { month: "Dec", earnings: 2500000, invested: 30000000 },
  { month: "Jan", earnings: 5500000, invested: 30000000 },
];

// ===== Mock Transactions =====
export const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "DEPOSIT",
    amount: 50000000,
    timestamp: "2025-10-01T10:30:00Z",
    status: "COMPLETED",
    txHash: "0xabc123...",
  },
  {
    id: "2",
    type: "INVESTMENT",
    amount: 15000000,
    timestamp: "2025-10-20T14:15:00Z",
    status: "COMPLETED",
    txHash: "0xdef456...",
  },
  {
    id: "3",
    type: "INVESTMENT",
    amount: 10000000,
    timestamp: "2025-11-15T09:45:00Z",
    status: "COMPLETED",
    txHash: "0xghi789...",
  },
  {
    id: "4",
    type: "PROFIT",
    amount: 2750000,
    timestamp: "2025-12-15T16:00:00Z",
    status: "COMPLETED",
    txHash: "0xjkl012...",
  },
  {
    id: "5",
    type: "INVESTMENT",
    amount: 5000000,
    timestamp: "2026-01-08T11:20:00Z",
    status: "COMPLETED",
    txHash: "0xmno345...",
  },
  {
    id: "6",
    type: "PROFIT",
    amount: 2750000,
    timestamp: "2026-01-10T08:00:00Z",
    status: "COMPLETED",
    txHash: "0xpqr678...",
  },
];
