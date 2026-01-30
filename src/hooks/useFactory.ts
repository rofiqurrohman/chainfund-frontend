import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CAMPAIGN_FACTORY_ABI } from "@/lib/contracts/abis";
import { CONTRACTS, toIdrxWei, getExplorerUrl } from "@/lib/contracts/config";
import { useState, useCallback } from "react";

// =============================================================
//                    READ HOOKS
// =============================================================

/**
 * Get campaign count from factory
 */
export function useCampaignCount() {
  return useReadContract({
    address: CONTRACTS.CAMPAIGN_FACTORY,
    abi: CAMPAIGN_FACTORY_ABI,
    functionName: "getCampaignCount",
  });
}

/**
 * Get all campaign addresses
 */
export function useCampaigns() {
  return useReadContract({
    address: CONTRACTS.CAMPAIGN_FACTORY,
    abi: CAMPAIGN_FACTORY_ABI,
    functionName: "getCampaigns",
  });
}

/**
 * Get campaigns by owner
 */
export function useCampaignsByOwner(owner: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.CAMPAIGN_FACTORY,
    abi: CAMPAIGN_FACTORY_ABI,
    functionName: "getCampaignsByOwner",
    args: owner ? [owner] : undefined,
    query: {
      enabled: !!owner,
    },
  });
}

/**
 * Check if address is valid campaign
 */
export function useIsValidCampaign(campaignAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.CAMPAIGN_FACTORY,
    abi: CAMPAIGN_FACTORY_ABI,
    functionName: "isValidCampaign",
    args: campaignAddress ? [campaignAddress] : undefined,
    query: {
      enabled: !!campaignAddress,
    },
  });
}

// =============================================================
//                    WRITE HOOKS
// =============================================================

interface CreateCampaignParams {
  targetAmount: number; // In IDRX (not wei)
  durationDays: number; // Duration in days
}

interface UseCreateCampaignResult {
  createCampaign: (params: CreateCampaignParams) => Promise<void>;
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
 * Hook to create a new campaign
 */
export function useCreateCampaign(): UseCreateCampaignResult {
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

  const createCampaign = useCallback(
    async (params: CreateCampaignParams) => {
      const targetAmountWei = toIdrxWei(params.targetAmount);
      const durationSeconds = BigInt(params.durationDays * 24 * 60 * 60);

      const hash = await writeContractAsync({
        address: CONTRACTS.CAMPAIGN_FACTORY,
        abi: CAMPAIGN_FACTORY_ABI,
        functionName: "createCampaign",
        args: [targetAmountWei, durationSeconds],
      });

      setTxHash(hash);
    },
    [writeContractAsync],
  );

  const reset = useCallback(() => {
    setTxHash(undefined);
    resetWrite();
  }, [resetWrite]);

  return {
    createCampaign,
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
