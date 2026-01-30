import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { CAMPAIGN_VAULT_ABI, ERC20_ABI } from "@/lib/contracts/abis";
import {
  CONTRACTS,
  toIdrxWei,
  fromIdrxWei,
  getExplorerUrl,
} from "@/lib/contracts/config";
import { useState, useCallback, useMemo } from "react";

// =============================================================
//                    CAMPAIGN INFO TYPE
// =============================================================

export interface CampaignInfo {
  owner: `0x${string}`;
  targetAmount: number;
  deadline: Date;
  totalRaised: number;
  withdrawn: boolean;
  investorCount: number;
}

// =============================================================
//                    READ HOOKS
// =============================================================

/**
 * Get campaign info from vault
 */
export function useCampaignInfo(campaignAddress: `0x${string}` | undefined) {
  const { data, ...rest } = useReadContract({
    address: campaignAddress,
    abi: CAMPAIGN_VAULT_ABI,
    functionName: "getCampaignInfo",
    query: {
      enabled: !!campaignAddress,
    },
  });

  const campaignInfo: CampaignInfo | undefined = useMemo(() => {
    if (!data) return undefined;
    const [
      owner,
      targetAmount,
      deadline,
      totalRaised,
      withdrawn,
      investorCount,
    ] = data;
    return {
      owner,
      targetAmount: fromIdrxWei(targetAmount),
      deadline: new Date(Number(deadline) * 1000),
      totalRaised: fromIdrxWei(totalRaised),
      withdrawn,
      investorCount: Number(investorCount),
    };
  }, [data]);

  return { data: campaignInfo, ...rest };
}

/**
 * Check if campaign is active
 */
export function useCampaignIsActive(
  campaignAddress: `0x${string}` | undefined,
) {
  return useReadContract({
    address: campaignAddress,
    abi: CAMPAIGN_VAULT_ABI,
    functionName: "isActive",
    query: {
      enabled: !!campaignAddress,
    },
  });
}

/**
 * Check if campaign is successful
 */
export function useCampaignIsSuccessful(
  campaignAddress: `0x${string}` | undefined,
) {
  return useReadContract({
    address: campaignAddress,
    abi: CAMPAIGN_VAULT_ABI,
    functionName: "isSuccessful",
    query: {
      enabled: !!campaignAddress,
    },
  });
}

/**
 * Get campaign progress (in basis points, 10000 = 100%)
 */
export function useCampaignProgress(
  campaignAddress: `0x${string}` | undefined,
) {
  const { data, ...rest } = useReadContract({
    address: campaignAddress,
    abi: CAMPAIGN_VAULT_ABI,
    functionName: "getProgress",
    query: {
      enabled: !!campaignAddress,
    },
  });

  const progress = data !== undefined ? Number(data) / 100 : undefined;
  return { data: progress, ...rest };
}

/**
 * Get user's contribution in a campaign
 */
export function useContribution(
  campaignAddress: `0x${string}` | undefined,
  investorAddress: `0x${string}` | undefined,
) {
  const { data, ...rest } = useReadContract({
    address: campaignAddress,
    abi: CAMPAIGN_VAULT_ABI,
    functionName: "getContribution",
    args: investorAddress ? [investorAddress] : undefined,
    query: {
      enabled: !!campaignAddress && !!investorAddress,
    },
  });

  const contribution = data !== undefined ? fromIdrxWei(data) : undefined;
  return { data: contribution, ...rest };
}

/**
 * Get IDRX balance
 */
export function useIdrxBalance(address: `0x${string}` | undefined) {
  const { data, ...rest } = useReadContract({
    address: CONTRACTS.IDRX_TOKEN,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const balance = data !== undefined ? fromIdrxWei(data) : undefined;
  return { data: balance, ...rest };
}

/**
 * Get IDRX allowance for a campaign
 */
export function useIdrxAllowance(
  ownerAddress: `0x${string}` | undefined,
  spenderAddress: `0x${string}` | undefined,
) {
  const { data, ...rest } = useReadContract({
    address: CONTRACTS.IDRX_TOKEN,
    abi: ERC20_ABI,
    functionName: "allowance",
    args:
      ownerAddress && spenderAddress
        ? [ownerAddress, spenderAddress]
        : undefined,
    query: {
      enabled: !!ownerAddress && !!spenderAddress,
    },
  });

  const allowance = data !== undefined ? fromIdrxWei(data) : undefined;
  return { data: allowance, ...rest };
}

// =============================================================
//                    WRITE HOOKS
// =============================================================

interface TransactionResult {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  txHash: `0x${string}` | undefined;
  explorerUrl: string | undefined;
  reset: () => void;
}

/**
 * Hook to approve IDRX spending
 */
export function useApproveIdrx(campaignAddress: `0x${string}` | undefined) {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const {
    writeContractAsync,
    isPending,
    isError: isWriteError,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const approve = useCallback(
    async (amount: number) => {
      if (!campaignAddress) throw new Error("Campaign address required");

      const amountWei = toIdrxWei(amount);

      const hash = await writeContractAsync({
        address: CONTRACTS.IDRX_TOKEN,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [campaignAddress, amountWei],
      });

      setTxHash(hash);
      return hash;
    },
    [campaignAddress, writeContractAsync],
  );

  const reset = useCallback(() => {
    setTxHash(undefined);
    resetWrite();
  }, [resetWrite]);

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    isError: isWriteError || isReceiptError,
    error: writeError || receiptError || null,
    txHash,
    explorerUrl: txHash ? getExplorerUrl("tx", txHash) : undefined,
    reset,
  };
}

/**
 * Hook to invest in a campaign
 */
export function useInvest(
  campaignAddress: `0x${string}` | undefined,
): TransactionResult & {
  invest: (amount: number) => Promise<void>;
} {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const {
    writeContractAsync,
    isPending,
    isError: isWriteError,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const invest = useCallback(
    async (amount: number) => {
      if (!campaignAddress) throw new Error("Campaign address required");

      const amountWei = toIdrxWei(amount);

      const hash = await writeContractAsync({
        address: campaignAddress,
        abi: CAMPAIGN_VAULT_ABI,
        functionName: "invest",
        args: [amountWei],
      });

      setTxHash(hash);
    },
    [campaignAddress, writeContractAsync],
  );

  const reset = useCallback(() => {
    setTxHash(undefined);
    resetWrite();
  }, [resetWrite]);

  return {
    invest,
    isPending,
    isConfirming,
    isSuccess,
    isError: isWriteError || isReceiptError,
    error: writeError || receiptError || null,
    txHash,
    explorerUrl: txHash ? getExplorerUrl("tx", txHash) : undefined,
    reset,
  };
}

/**
 * Hook to withdraw funds (for campaign owner)
 */
export function useWithdraw(
  campaignAddress: `0x${string}` | undefined,
): TransactionResult & {
  withdraw: () => Promise<void>;
} {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const {
    writeContractAsync,
    isPending,
    isError: isWriteError,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const withdraw = useCallback(async () => {
    if (!campaignAddress) throw new Error("Campaign address required");

    const hash = await writeContractAsync({
      address: campaignAddress,
      abi: CAMPAIGN_VAULT_ABI,
      functionName: "withdrawByOwner",
    });

    setTxHash(hash);
  }, [campaignAddress, writeContractAsync]);

  const reset = useCallback(() => {
    setTxHash(undefined);
    resetWrite();
  }, [resetWrite]);

  return {
    withdraw,
    isPending,
    isConfirming,
    isSuccess,
    isError: isWriteError || isReceiptError,
    error: writeError || receiptError || null,
    txHash,
    explorerUrl: txHash ? getExplorerUrl("tx", txHash) : undefined,
    reset,
  };
}

/**
 * Hook to claim refund (for investors)
 */
export function useClaimRefund(
  campaignAddress: `0x${string}` | undefined,
): TransactionResult & {
  claimRefund: () => Promise<void>;
} {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const {
    writeContractAsync,
    isPending,
    isError: isWriteError,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const claimRefund = useCallback(async () => {
    if (!campaignAddress) throw new Error("Campaign address required");

    const hash = await writeContractAsync({
      address: campaignAddress,
      abi: CAMPAIGN_VAULT_ABI,
      functionName: "claimRefund",
    });

    setTxHash(hash);
  }, [campaignAddress, writeContractAsync]);

  const reset = useCallback(() => {
    setTxHash(undefined);
    resetWrite();
  }, [resetWrite]);

  return {
    claimRefund,
    isPending,
    isConfirming,
    isSuccess,
    isError: isWriteError || isReceiptError,
    error: writeError || receiptError || null,
    txHash,
    explorerUrl: txHash ? getExplorerUrl("tx", txHash) : undefined,
    reset,
  };
}

// =============================================================
//                    COMBINED INVEST HOOK
// =============================================================

interface UseInvestWithApprovalResult {
  investWithApproval: (amount: number) => Promise<void>;
  step: "idle" | "approving" | "investing" | "success" | "error";
  isPending: boolean;
  error: Error | null;
  approveTxHash: `0x${string}` | undefined;
  investTxHash: `0x${string}` | undefined;
  reset: () => void;
}

/**
 * Combined hook to approve and invest in one flow
 */
export function useInvestWithApproval(
  campaignAddress: `0x${string}` | undefined,
): UseInvestWithApprovalResult {
  const { address } = useAccount();
  const [step, setStep] = useState<
    "idle" | "approving" | "investing" | "success" | "error"
  >("idle");
  const [error, setError] = useState<Error | null>(null);
  const [approveTxHash, setApproveTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [investTxHash, setInvestTxHash] = useState<`0x${string}` | undefined>();

  const { data: allowance, refetch: refetchAllowance } = useIdrxAllowance(
    address,
    campaignAddress,
  );
  const { writeContractAsync } = useWriteContract();

  const investWithApproval = useCallback(
    async (amount: number) => {
      if (!campaignAddress || !address) {
        throw new Error("Not connected");
      }

      try {
        setError(null);
        const amountWei = toIdrxWei(amount);

        // Check if approval needed
        const currentAllowance = allowance ?? 0;
        if (currentAllowance < amount) {
          setStep("approving");

          const approveHash = await writeContractAsync({
            address: CONTRACTS.IDRX_TOKEN,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [campaignAddress, amountWei],
          });

          setApproveTxHash(approveHash);

          // Wait a bit for approval to be mined
          await new Promise((resolve) => setTimeout(resolve, 3000));
          await refetchAllowance();
        }

        // Invest
        setStep("investing");

        const investHash = await writeContractAsync({
          address: campaignAddress,
          abi: CAMPAIGN_VAULT_ABI,
          functionName: "invest",
          args: [amountWei],
        });

        setInvestTxHash(investHash);
        setStep("success");
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Transaction failed"));
        setStep("error");
        throw err;
      }
    },
    [campaignAddress, address, allowance, writeContractAsync, refetchAllowance],
  );

  const reset = useCallback(() => {
    setStep("idle");
    setError(null);
    setApproveTxHash(undefined);
    setInvestTxHash(undefined);
  }, []);

  return {
    investWithApproval,
    step,
    isPending: step === "approving" || step === "investing",
    error,
    approveTxHash,
    investTxHash,
    reset,
  };
}
