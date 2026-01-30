import { useState, useCallback, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { useWalletStats, useTransactions, type Transaction } from "./useApi";
import { IDRX_CONTRACT_ADDRESS } from "@/lib/wagmi";

const MOCK_IDRX_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "subtractedValue", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "addedValue", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Platform escrow address (this should be your deployed contract)
const PLATFORM_ESCROW_ADDRESS =
  "0x0000000000000000000000000000000000000001" as `0x${string}`;

// IDRX has 2 decimals (like IDR)
const IDRX_DECIMALS = 18;

interface WalletStats {
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  pendingTransactions: number;
}

interface UseWalletBalanceReturn {
  balance: number;
  idrxOnChainBalance: bigint;
  stats: WalletStats;
  transactions: Transaction[];
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  deposit: (amount: number) => Promise<boolean>;
  withdraw: (amount: number) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
}

export function useWalletBalance(): UseWalletBalanceReturn {
  // const { walletAddress, isAuthenticated } = useAuth();
  const { address } = useAccount();

  // Get on-chain IDRX balance
  const { data: idrxBalance, refetch: refetchBalance } = useBalance({
    address: address,
    token: IDRX_CONTRACT_ADDRESS,
  });

  // Get backend wallet stats
  const {
    data: walletData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useWalletStats();

  // Get transactions
  const {
    data: txData,
    isLoading: isLoadingTx,
    refetch: refetchTx,
  } = useTransactions({ limit: 20 });

  // Contract write for deposit (transfer to platform)
  const {
    writeContract: writeDeposit,
    data: depositHash,
    isPending: isDepositPending,
    error: depositError,
  } = useWriteContract();

  // Contract write for withdraw (platform sends back - requires backend signature)
  const {
    writeContract: writeWithdraw,
    data: withdrawHash,
    isPending: isWithdrawPending,
    error: withdrawError,
  } = useWriteContract();

  // Wait for deposit transaction
  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } =
    useWaitForTransactionReceipt({
      hash: depositHash,
    });

  // Wait for withdraw transaction
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } =
    useWaitForTransactionReceipt({
      hash: withdrawHash,
    });

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate balance (on-chain IDRX converted to number)
  const idrxOnChainBalance = idrxBalance?.value ?? BigInt(0);
  const onChainBalanceNumber = idrxBalance
    ? parseFloat(formatUnits(idrxBalance.value, IDRX_DECIMALS))
    : 0;

  // Use backend balance for platform credits, or on-chain for wallet balance
  // const balance = walletData?.wallet?.balance ?? onChainBalanceNumber;
  const balance = onChainBalanceNumber;

  const stats: WalletStats = {
    balance: balance,
    totalDeposited: walletData?.wallet?.totalDeposited ?? 0,
    totalWithdrawn: walletData?.wallet?.totalWithdrawn ?? 0,
    pendingTransactions: walletData?.wallet?.pendingTransactions ?? 0,
  };

  const transactions: Transaction[] = txData?.transactions ?? [];

  // Refresh after successful transactions
  useEffect(() => {
    if (isDepositSuccess || isWithdrawSuccess) {
      refetchBalance();
      refetchStats();
      refetchTx();
    }
  }, [isDepositSuccess, isWithdrawSuccess]);

  // Deposit: Transfer IDRX from user wallet to platform escrow
  const deposit = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!address) {
        setError("Wallet not connected");
        return false;
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Convert amount to token units (2 decimals)
        const amountInUnits = parseUnits(amount.toString(), IDRX_DECIMALS);

        // Check balance
        if (idrxOnChainBalance < amountInUnits) {
          throw new Error("Insufficient IDRX balance in wallet");
        }

        // Execute transfer to platform escrow
        writeDeposit({
          address: IDRX_CONTRACT_ADDRESS,
          abi: MOCK_IDRX_ABI,
          functionName: "transfer",
          args: [PLATFORM_ESCROW_ADDRESS, amountInUnits],
        });

        // Note: The actual success is tracked via useWaitForTransactionReceipt
        // For now we return true to indicate the transaction was submitted
        setTimeout(() => setIsProcessing(false), 1000);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Deposit failed";
        setError(message);
        setIsProcessing(false);
        return false;
      }
    },
    [address, idrxOnChainBalance, writeDeposit],
  );

  // Withdraw: Request platform to send IDRX back to user
  // In a real implementation, this would call the backend API which would
  // then trigger a signed transaction from the platform wallet
  const withdraw = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!address) {
        setError("Wallet not connected");
        return false;
      }

      setIsProcessing(true);
      setError(null);

      try {
        const amountInUnits = parseUnits(amount.toString(), IDRX_DECIMALS);
        // Check platform balance
        if (amount > balance) {
          throw new Error("Insufficient platform balance");
        }

        // In production, this would call the backend API:
        // await api.requestWithdrawal({ amount, toAddress: address });
        // The backend would then process the withdrawal
        writeWithdraw({
          address: IDRX_CONTRACT_ADDRESS,
          abi: MOCK_IDRX_ABI,
          functionName: "transfer",
          args: [PLATFORM_ESCROW_ADDRESS, amountInUnits],
        });

        // For demo, we simulate success
        console.log(`Withdrawal request: ${amount} IDRX to ${address}`);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Refresh balances
        await refetchStats();
        await refetchTx();

        setIsProcessing(false);
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Withdrawal failed";
        setError(message);
        setIsProcessing(false);
        return false;
      }
    },
    [address, balance, refetchStats, refetchTx],
  );

  const refreshBalance = useCallback(async (): Promise<void> => {
    await Promise.all([refetchBalance(), refetchStats(), refetchTx()]);
  }, [refetchBalance, refetchStats, refetchTx]);

  // Combine errors
  const combinedError =
    error ||
    (depositError ? depositError.message : null) ||
    (withdrawError ? withdrawError.message : null);

  return {
    balance,
    idrxOnChainBalance,
    stats,
    transactions,
    isLoading: isLoadingStats || isLoadingTx,
    isProcessing:
      isProcessing ||
      isDepositPending ||
      isWithdrawPending ||
      isDepositConfirming ||
      isWithdrawConfirming,
    error: combinedError,
    deposit,
    withdraw,
    refreshBalance,
  };
}
