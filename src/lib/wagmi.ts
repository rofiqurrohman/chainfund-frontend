import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// IDRX Token Contract Address (Testnet)
export const IDRX_CONTRACT_ADDRESS = '0xa42b876F75d955De6D721dc15f61f2e533FC0855' as const;

// Platform Contract Address (Mocked)
export const PLATFORM_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

// RainbowKit + wagmi config
export const config = getDefaultConfig({
    appName: 'ChainFund',
    projectId: 'chainfund-rwa-crowdfunding', // Replace with actual WalletConnect Project ID
    chains: [base, baseSepolia],
    transports: {
        [base.id]: http(),
        [baseSepolia.id]: http(),
    },
});

// Standalone wagmi config (for non-RainbowKit usage)
export const wagmiConfig = createConfig({
    chains: [baseSepolia],
    transports: {
        // [base.id]: http(),
        [baseSepolia.id]: http(),
    },
});

// Chain configuration
export const supportedChains = [base, baseSepolia] as const;
export const defaultChain = baseSepolia;
