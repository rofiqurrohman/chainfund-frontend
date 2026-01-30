import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { baseSepolia } from 'viem/chains';

// Privy App ID - get from Privy Dashboard
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'your-privy-app-id';

interface PrivyProviderProps {
    children: React.ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
    return (
        <BasePrivyProvider
            appId={PRIVY_APP_ID}
            config={{
                // Appearance
                appearance: {
                    theme: 'dark',
                    accentColor: '#4f46e5',
                    logo: '/logo.png',
                    showWalletLoginFirst: false,
                },
                // Login methods
                loginMethods: ['email', 'wallet'],
                // Embedded wallet configuration - create for all users
                embeddedWallets: {
                    createOnLogin: 'all-users',
                },
                // Supported chains
                defaultChain: baseSepolia,
                supportedChains: [baseSepolia],
                // Legal
                legal: {
                    termsAndConditionsUrl: '/terms',
                    privacyPolicyUrl: '/privacy',
                },
            }}
        >
            {children}
        </BasePrivyProvider>
    );
}

export { PRIVY_APP_ID };
