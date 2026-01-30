import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';

import { PrivyProvider } from '@/lib/privy';
import { AuthProvider } from '@/contexts/AuthContext';
import { wagmiConfig } from '@/lib/wagmi';
import { HomePage } from '@/pages/HomePage';
import { MarketplacePage } from '@/pages/MarketplacePage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardOverview } from '@/pages/dashboard/DashboardOverview';
import { WalletPage } from '@/pages/dashboard/WalletPage';
import { InvestmentsPage } from '@/pages/dashboard/InvestmentsPage';
import { MyFundingsPage } from '@/pages/dashboard/MyFundingsPage';
import { CreateFundingPage } from '@/pages/dashboard/CreateFundingPage';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30000,
            retry: 1,
        },
    },
});

function App() {
    return (
        <PrivyProvider>
            <QueryClientProvider client={queryClient}>
                <WagmiProvider config={wagmiConfig}>
                    <AuthProvider>
                        <BrowserRouter>
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<HomePage />} />
                                <Route path="/projects" element={<MarketplacePage />} />
                                <Route path="/projects/:id" element={<ProjectDetailPage />} />

                                {/* Protected Dashboard Routes */}
                                <Route path="/dashboard" element={
                                    <ProtectedRoute>
                                        <DashboardLayout />
                                    </ProtectedRoute>
                                }>
                                    <Route index element={<DashboardOverview />} />
                                    <Route path="wallet" element={<WalletPage />} />
                                    <Route path="investments" element={<InvestmentsPage />} />
                                    <Route path="my-fundings" element={<MyFundingsPage />} />
                                    <Route path="my-fundings/create" element={<CreateFundingPage />} />
                                    <Route path="my-fundings/:id/edit" element={<CreateFundingPage />} />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </AuthProvider>
                </WagmiProvider>
            </QueryClientProvider>
        </PrivyProvider>
    );
}

export default App;
