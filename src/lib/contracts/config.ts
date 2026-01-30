import { baseSepolia, base } from "wagmi/chains";

// =============================================================
//                    CONTRACT ADDRESSES
// =============================================================

export const CONTRACTS = {
  // CampaignFactory - deployed contract address
  CAMPAIGN_FACTORY:
    "0x86dE4584E46c52A6f7bB910a924C419c9A5F346f" as `0x${string}`,

  // IDRX Token address (update with actual IDRX address)
  IDRX_TOKEN: (import.meta.env.VITE_IDRX_TOKEN_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
} as const;

// =============================================================
//                    CHAIN CONFIGURATION
// =============================================================

const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || "84532");

export const getChain = () => {
  switch (CHAIN_ID) {
    case 8453:
      return base;
    case 84532:
    default:
      return baseSepolia;
  }
};

export const SUPPORTED_CHAINS = [baseSepolia, base] as const;

// =============================================================
//                    CONSTANTS
// =============================================================

export const IDRX_DECIMALS = 18;

// Convert IDRX amount to wei (with decimals)
export const toIdrxWei = (amount: number): bigint => {
  return BigInt(Math.floor(amount * 10 ** IDRX_DECIMALS));
};

// Convert wei to IDRX amount
export const fromIdrxWei = (wei: bigint): number => {
  return Number(wei) / 10 ** IDRX_DECIMALS;
};

// Format IDRX amount for display
export const formatIdrx = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("IDR", "IDRX");
};

// =============================================================
//                    BLOCK EXPLORER
// =============================================================

export const getExplorerUrl = (
  type: "tx" | "address",
  hash: string,
): string => {
  const chain = getChain();
  const baseUrl =
    chain.id === 8453 ? "https://basescan.org" : "https://sepolia.basescan.org";

  return `${baseUrl}/${type}/${hash}`;
};
