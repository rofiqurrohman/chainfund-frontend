import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIDRX(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getRiskColor(risk: string): string {
  const colors: Record<string, string> = {
    LOW: 'bg-green-500/10 text-green-600 border-green-500/20',
    MEDIUM: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    HIGH: 'bg-red-500/10 text-red-600 border-red-500/20',
  };
  return colors[risk] || colors.MEDIUM;
}

export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
}

export function calculateEstimatedProfit(amount: number, roiPercentage: number, durationMonths: number): number {
  const monthlyRate = roiPercentage / 12 / 100;
  return amount * monthlyRate * durationMonths;
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    LOCKED: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    RUNNING: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    PROFIT_GENERATING: 'bg-green-500/10 text-green-600 border-green-500/20',
    COMPLETED: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    FAILED: 'bg-red-500/10 text-red-600 border-red-500/20',
  };
  return colors[status] || colors.RUNNING;
}

export function formatPercentage(value: number): string {
  return value.toFixed(2) + '%';
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}