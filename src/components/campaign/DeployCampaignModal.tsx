import { useState, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt, useWriteContract, usePublicClient } from 'wagmi';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Loader2,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Rocket,
    AlertCircle,
} from 'lucide-react';
import { CAMPAIGN_FACTORY_ABI } from '@/lib/contracts/abis';
import { CONTRACTS, toIdrxWei, getExplorerUrl } from '@/lib/contracts/config';
import { formatIDRX } from '@/lib/utils';
import { parseEventLogs } from 'viem';

interface DeployCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    funding: {
        id: string;
        name: string;
        fundingTarget: number;
        durationMonths: number;
        remainingDays: number;
    };
    onDeploySuccess: (contractAddress: string) => void;
}

type DeployStep = 'confirm' | 'deploying' | 'success' | 'error';

export function DeployCampaignModal({
    isOpen,
    onClose,
    funding,
    onDeploySuccess,
}: DeployCampaignModalProps) {
    const { address, isConnected } = useAccount();
    const publicClient = usePublicClient();
    const [step, setStep] = useState<DeployStep>('confirm');
    const [error, setError] = useState<string>('');
    const [deployedAddress, setDeployedAddress] = useState<string>('');

    const {
        writeContractAsync,
        data: txHash,
        isPending,
        reset: resetWrite,
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        data: receipt,
    } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Calculate duration in seconds (use remainingDays or estimate from durationMonths)
    const durationDays = funding.remainingDays > 0 
        ? funding.remainingDays 
        : funding.durationMonths * 30;
    const durationSeconds = durationDays * 24 * 60 * 60;

    // Parse campaign address from transaction receipt
    useEffect(() => {
        if (isConfirmed && receipt && publicClient) {
            try {
                // Parse the CampaignCreated event to get the campaign address
                const logs = parseEventLogs({
                    abi: CAMPAIGN_FACTORY_ABI,
                    logs: receipt.logs,
                    eventName: 'CampaignCreated',
                });

                if (logs.length > 0) {
                    const campaignAddress = (logs[0] as unknown as { args: { campaign: string } }).args.campaign;
                    setDeployedAddress(campaignAddress);
                    setStep('success');
                    onDeploySuccess(campaignAddress);
                } else {
                    setError('Could not find campaign address in transaction');
                    setStep('error');
                }
            } catch (err) {
                console.error('Error parsing logs:', err);
                setError('Failed to parse transaction logs');
                setStep('error');
            }
        }
    }, [isConfirmed, receipt, publicClient, onDeploySuccess]);

    const handleDeploy = async () => {
        if (!address) {
            setError('Wallet not connected');
            return;
        }

        setStep('deploying');
        setError('');

        try {
            await writeContractAsync({
                address: CONTRACTS.CAMPAIGN_FACTORY,
                abi: CAMPAIGN_FACTORY_ABI,
                functionName: 'createCampaign',
                args: [toIdrxWei(funding.fundingTarget), BigInt(durationSeconds)],
            });
        } catch (err) {
            console.error('Deploy error:', err);
            setError(err instanceof Error ? err.message : 'Failed to deploy campaign');
            setStep('error');
        }
    };

    const handleClose = () => {
        setStep('confirm');
        setError('');
        setDeployedAddress('');
        resetWrite();
        onClose();
    };

    const renderContent = () => {
        switch (step) {
            case 'confirm':
                return (
                    <div className="space-y-4">
                        <div className="bg-[hsl(var(--muted))] p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-[hsl(var(--muted-foreground))]">Campaign</span>
                                <span className="font-semibold">{funding.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[hsl(var(--muted-foreground))]">Target</span>
                                <span className="font-semibold">{formatIDRX(funding.fundingTarget)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[hsl(var(--muted-foreground))]">Duration</span>
                                <span className="font-semibold">{durationDays} days</span>
                            </div>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="font-semibold text-yellow-500">Gas Fee Required</p>
                                    <p className="text-[hsl(var(--muted-foreground))]">
                                        Deploying to blockchain requires gas fee in ETH on Base Sepolia.
                                        Make sure you have enough ETH in your wallet.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleDeploy}
                            disabled={!isConnected}
                            className="w-full"
                        >
                            <Rocket className="h-4 w-4 mr-2" />
                            Deploy to Blockchain
                        </Button>
                    </div>
                );

            case 'deploying':
                return (
                    <div className="space-y-4 text-center py-8">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-[hsl(var(--primary))]" />
                        <div>
                            <p className="font-semibold">
                                {isPending ? 'Confirm in Wallet' : 'Deploying Contract...'}
                            </p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                {isPending
                                    ? 'Please confirm the transaction in your wallet'
                                    : isConfirming
                                    ? 'Waiting for blockchain confirmation...'
                                    : 'Processing...'}
                            </p>
                        </div>
                        {txHash && (
                            <a
                                href={getExplorerUrl('tx', txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[hsl(var(--primary))] hover:underline inline-flex items-center gap-1"
                            >
                                View on Explorer
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                    </div>
                );

            case 'success':
                return (
                    <div className="space-y-4 text-center py-8">
                        <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
                        <div>
                            <p className="font-semibold text-green-500">Campaign Deployed!</p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                                Your campaign is now live on the blockchain.
                            </p>
                        </div>
                        <div className="bg-[hsl(var(--muted))] p-3 rounded-lg">
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Contract Address</p>
                            <p className="font-mono text-sm break-all">{deployedAddress}</p>
                        </div>
                        <div className="flex gap-2">
                            <a
                                href={getExplorerUrl('address', deployedAddress)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1"
                            >
                                <Button variant="outline" className="w-full">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Contract
                                </Button>
                            </a>
                            <Button onClick={handleClose} className="flex-1">
                                Done
                            </Button>
                        </div>
                    </div>
                );

            case 'error':
                return (
                    <div className="space-y-4 text-center py-8">
                        <XCircle className="h-12 w-12 mx-auto text-red-500" />
                        <div>
                            <p className="font-semibold text-red-500">Deployment Failed</p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                                {error || 'Something went wrong'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    setStep('confirm');
                                    setError('');
                                    resetWrite();
                                }}
                                className="flex-1"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-[hsl(var(--primary))]" />
                        Deploy Campaign
                    </DialogTitle>
                    <DialogDescription>
                        Deploy your campaign to the blockchain to start accepting investments.
                    </DialogDescription>
                </DialogHeader>
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
}
