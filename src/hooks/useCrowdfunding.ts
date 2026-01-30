import { useState, useCallback } from 'react';
import { mockUser, mockInvestments } from '@/services/mockData';
import type { Investment } from '@/types';

interface UseCrowdfundingReturn {
    isLoading: boolean;
    error: string | null;
    invest: (projectId: string, amount: number) => Promise<boolean>;
    claimProfit: (projectId: string) => Promise<boolean>;
    refund: (projectId: string) => Promise<boolean>;
    getUserInvestments: () => Investment[];
}

export function useCrowdfunding(): UseCrowdfundingReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const invest = useCallback(async (projectId: string, amount: number): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            // Simulate blockchain transaction delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock validation
            if (amount > mockUser.balance) {
                throw new Error('Insufficient IDRX balance');
            }

            if (amount <= 0) {
                throw new Error('Invalid investment amount');
            }

            // In real implementation, this would call the smart contract
            console.log(`Investing ${amount} IDRX in project ${projectId}`);

            setIsLoading(false);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Investment failed');
            setIsLoading(false);
            return false;
        }
    }, []);

    const claimProfit = useCallback(async (projectId: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const investment = mockInvestments.find(inv => inv.projectId === projectId);
            if (!investment) {
                throw new Error('Investment not found');
            }

            if (investment.status !== 'PROFIT_GENERATING' && investment.status !== 'COMPLETED') {
                throw new Error('Profit not available yet');
            }

            console.log(`Claiming profit for project ${projectId}`);

            setIsLoading(false);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to claim profit');
            setIsLoading(false);
            return false;
        }
    }, []);

    const refund = useCallback(async (projectId: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const investment = mockInvestments.find(inv => inv.projectId === projectId);
            if (!investment) {
                throw new Error('Investment not found');
            }

            if (investment.status !== 'FAILED') {
                throw new Error('Refund not available for this investment');
            }

            console.log(`Refunding investment for project ${projectId}`);

            setIsLoading(false);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Refund failed');
            setIsLoading(false);
            return false;
        }
    }, []);

    const getUserInvestments = useCallback((): Investment[] => {
        return mockInvestments;
    }, []);

    return {
        isLoading,
        error,
        invest,
        claimProfit,
        refund,
        getUserInvestments,
    };
}
