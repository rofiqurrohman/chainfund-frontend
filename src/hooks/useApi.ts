import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Funding, type Investment, type DashboardStats, type EarningsData, type Transaction, type WalletStats } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

// Initialize API with auth token
function useApiInit() {
    const { getAccessToken } = useAuth();

    useEffect(() => {
        api.setTokenGetter(getAccessToken);
    }, [getAccessToken]);
}

// ===== Fundings Hooks =====

export function useFundings(params?: {
    page?: number;
    limit?: number;
    industry?: string;
    riskLevel?: string;
    search?: string;
}) {
    useApiInit();

    return useQuery({
        queryKey: ['fundings', params],
        queryFn: () => api.getFundings(params),
        staleTime: 30000, // 30 seconds
    });
}

export function useFunding(id: string) {
    useApiInit();

    return useQuery({
        queryKey: ['funding', id],
        queryFn: () => api.getFunding(id),
        enabled: !!id,
    });
}

export function useMyFundings() {
    useApiInit();
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['myFundings'],
        queryFn: () => api.getMyFundings(),
        enabled: isAuthenticated,
    });
}

export function useCreateFunding() {
    useApiInit();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Funding>) => api.createFunding(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fundings'] });
            queryClient.invalidateQueries({ queryKey: ['myFundings'] });
        },
    });
}

export function useUpdateFunding() {
    useApiInit();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Funding> }) =>
            api.updateFunding(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['fundings'] });
            queryClient.invalidateQueries({ queryKey: ['funding', id] });
            queryClient.invalidateQueries({ queryKey: ['myFundings'] });
        },
    });
}

export function useDeleteFunding() {
    useApiInit();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.deleteFunding(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fundings'] });
            queryClient.invalidateQueries({ queryKey: ['myFundings'] });
        },
    });
}

// ===== Investments Hooks =====

export function useInvestments() {
    useApiInit();
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['investments'],
        queryFn: () => api.getInvestments(),
        enabled: isAuthenticated,
    });
}

export function useCreateInvestment() {
    useApiInit();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { fundingId: string; amount: number }) =>
            api.createInvestment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['investments'] });
            queryClient.invalidateQueries({ queryKey: ['fundings'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
    });
}

// ===== Dashboard Hooks =====

export function useDashboardStats() {
    useApiInit();
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['dashboardStats'],
        queryFn: () => api.getDashboardStats(),
        enabled: isAuthenticated,
    });
}

export function useEarningsData() {
    useApiInit();
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['earningsData'],
        queryFn: () => api.getEarningsData(),
        enabled: isAuthenticated,
    });
}

export function useTransactions(params?: { limit?: number; offset?: number }) {
    useApiInit();
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['transactions', params],
        queryFn: () => api.getTransactions(params),
        enabled: isAuthenticated,
    });
}

export function useWalletStats() {
    useApiInit();
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['walletStats'],
        queryFn: () => api.getWalletStats(),
        enabled: isAuthenticated,
    });
}

// Re-export types for convenience
export type { Funding, Investment, DashboardStats, EarningsData, Transaction, WalletStats };
