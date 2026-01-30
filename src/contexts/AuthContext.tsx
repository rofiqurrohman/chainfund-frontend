import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';

// User type from backend
interface User {
    id: string;
    email: string | null;
    walletAddress: string | null;
    name: string | null;
    avatarUrl: string | null;
    createdAt: string;
}

interface UserStats {
    totalInvested: number;
    totalEarnings: number;
    activeInvestments: number;
    completedInvestments: number;
}

interface AuthContextType {
    // Auth state
    isAuthenticated: boolean;
    isLoading: boolean;
    privyUser: ReturnType<typeof usePrivy>['user'];
    user: User | null;
    userStats: UserStats | null;

    // Auth methods
    login: () => void;
    logout: () => Promise<void>;

    // Token
    getAccessToken: () => Promise<string | null>;

    // Wallet
    walletAddress: string | null;

    // Refresh
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const {
        ready,
        authenticated,
        user: privyUser,
        login,
        logout: privyLogout,
        getAccessToken,
    } = usePrivy();

    const { wallets } = useWallets();

    const [user, setUser] = useState<User | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Get primary wallet address
    const walletAddress = wallets?.[0]?.address || null;

    // Fetch user data from backend with retry logic
    const fetchUserData = async (retries = 3) => {
        if (!authenticated) {
            setUser(null);
            setUserStats(null);
            setIsLoading(false);
            return;
        }

        try {
            const token = await getAccessToken();
            if (!token) {
                console.warn('[Auth] No access token available');
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setUserStats(data.stats);
                console.log('[Auth] User data fetched successfully');
            } else if (response.status === 401 && retries > 0) {
                // User might still be syncing, retry after a short delay
                console.log(`[Auth] Got 401, retrying in 1s... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchUserData(retries - 1);
            } else {
                console.error('[Auth] Failed to fetch user data:', response.status);
            }
        } catch (error) {
            console.error('[Auth] Error fetching user data:', error);
            if (retries > 0) {
                console.log(`[Auth] Retrying in 1s... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchUserData(retries - 1);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch user data when authenticated state changes
    useEffect(() => {
        if (ready) {
            fetchUserData();
        }
    }, [ready, authenticated]);

    // Logout handler
    const handleLogout = async () => {
        await privyLogout();
        setUser(null);
        setUserStats(null);
    };

    const value: AuthContextType = {
        isAuthenticated: authenticated,
        isLoading: !ready || isLoading,
        privyUser,
        user,
        userStats,
        login,
        logout: handleLogout,
        getAccessToken,
        walletAddress,
        refreshUser: fetchUserData,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
