import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Loader2,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Wallet,
    ArrowRight,
    AlertCircle,
} from 'lucide-react';
import { useInvestWithApproval, useIdrxBalance, useContribution } from '@/hooks/useCampaign';
import { getExplorerUrl } from '@/lib/contracts/config';
import { formatIDRX } from '@/lib/utils';
import { api } from '@/services/api';

interface InvestModalProps {
    isOpen: boolean;
    onClose: () => void;
    fundingId: string;
    campaignAddress: `0x${string}`;
    projectName: string;
    minimumInvestment: number;
    roiPercentage: number;
    durationMonths: number;
    onSuccess?: () => void;
}

type Step = 'input' | 'approving' | 'investing' | 'success' | 'error';

export function InvestModal({
    isOpen,
    onClose,
    fundingId,
    campaignAddress,
    projectName,
    minimumInvestment,
    roiPercentage,
    durationMonths,
    onSuccess,
}: InvestModalProps) {
    const { address, isConnected } = useAccount();
    const [amount, setAmount] = useState('');
    const [step, setStep] = useState<Step>('input');

    const { data: balance } = useIdrxBalance(address);
    const { data: currentContribution } = useContribution(campaignAddress, address);
    const {
        investWithApproval,
        step: txStep,
        isPending,
        error,
        approveTxHash,
        investTxHash,
        reset: resetTx,
    } = useInvestWithApproval(campaignAddress);

    // Sync transaction step with local step
    useEffect(() => {
        if (txStep === 'approving') setStep('approving');
        else if (txStep === 'investing') setStep('investing');
        else if (txStep === 'success') setStep('success');
        else if (txStep === 'error') setStep('error');
    }, [txStep]);

    const amountNum = parseFloat(amount) || 0;
    const expectedReturn = amountNum * (1 + roiPercentage / 100);
    const isValidAmount = amountNum >= minimumInvestment && amountNum <= (balance || 0);

    const handleInvest = async () => {
        if (!isValidAmount || !isConnected) return;

        try {
            await investWithApproval(amountNum);
            // Note: DB save will happen in useEffect when investTxHash is set
        } catch (err) {
            console.error('Investment failed:', err);
        }
    };

    // Save investment to database after successful blockchain tx
    useEffect(() => {
        if (step === 'success' && investTxHash && fundingId) {
            api.createInvestment({
                fundingId,
                amount: amountNum,
                txHash: investTxHash,
            }).then(() => {
                console.log('Investment saved to database');
            }).catch((err) => {
                console.error('Failed to save investment to database:', err);
            });
        }
    }, [step, investTxHash, fundingId, amountNum]);

    const handleClose = () => {
        if (!isPending) {
            setAmount('');
            setStep('input');
            resetTx();
            if (step === 'success' && onSuccess) {
                onSuccess();
            }
            onClose();
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 'input':
                return (
                    <div className="space-y-6">
                        {/* Balance Display */}
                        <div className="p-4 rounded-xl bg-[hsl(var(--muted))]">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                                    Your IDRX Balance
                                </span>
                                <span className="font-semibold">
                                    {balance !== undefined ? `Rp ${formatIDRX(balance)}` : 'Loading...'}
                                </span>
                            </div>
                            {currentContribution !== undefined && currentContribution > 0 && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[hsl(var(--border))]">
                                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                                        Already Invested
                                    </span>
                                    <span className="font-semibold text-green-600">
                                        Rp {formatIDRX(currentContribution)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Amount Input */}
                        <div className="space-y-2">
                            <Label htmlFor="invest-amount">Investment Amount (IDRX)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                                    Rp
                                </span>
                                <Input
                                    id="invest-amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-10 text-lg h-12"
                                    placeholder={minimumInvestment.toString()}
                                    min={minimumInvestment}
                                    max={balance || undefined}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                                <span>Min: Rp {formatIDRX(minimumInvestment)}</span>
                                <button
                                    type="button"
                                    className="text-[hsl(var(--primary))] hover:underline"
                                    onClick={() => setAmount((balance || 0).toString())}
                                >
                                    Use Max
                                </button>
                            </div>
                        </div>

                        {/* Expected Return Preview */}
                        {amountNum > 0 && (
                            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm">Expected Return</span>
                                    <span className="font-bold text-green-600">
                                        Rp {formatIDRX(expectedReturn)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
                                    <span>ROI: {roiPercentage}%</span>
                                    <span>Duration: {durationMonths} months</span>
                                </div>
                            </div>
                        )}

                        {/* Validation Error */}
                        {amount && !isValidAmount && (
                            <div className="flex items-center gap-2 text-sm text-red-500">
                                <AlertCircle size={16} />
                                {amountNum < minimumInvestment
                                    ? `Minimum investment is Rp ${formatIDRX(minimumInvestment)}`
                                    : 'Insufficient balance'}
                            </div>
                        )}

                        {/* Invest Button */}
                        <Button
                            className="w-full"
                            size="lg"
                            variant="gradient"
                            onClick={handleInvest}
                            disabled={!isValidAmount || !isConnected}
                        >
                            <Wallet size={18} className="mr-2" />
                            Confirm Investment
                        </Button>

                        <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
                            You will be asked to approve IDRX spending, then confirm the investment.
                        </p>
                    </div>
                );

            case 'approving':
            case 'investing':
                return (
                    <div className="py-8 space-y-6 text-center">
                        <div className="relative mx-auto w-20 h-20">
                            <Loader2 size={80} className="animate-spin text-[hsl(var(--primary))]" />
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-2">
                                {step === 'approving' ? 'Approving IDRX...' : 'Confirming Investment...'}
                            </h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                {step === 'approving'
                                    ? 'Please confirm the approval transaction in your wallet.'
                                    : 'Please confirm the investment transaction in your wallet.'}
                            </p>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center justify-center gap-2">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                step === 'approving' ? 'bg-[hsl(var(--primary))] text-white' : 'bg-green-500 text-white'
                            }`}>
                                {step === 'investing' ? <CheckCircle2 size={16} /> : '1'}
                            </div>
                            <ArrowRight size={16} className="text-[hsl(var(--muted-foreground))]" />
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                step === 'investing' ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--muted))]'
                            }`}>
                                2
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                            <span className={step === 'approving' ? 'font-semibold text-[hsl(var(--foreground))]' : ''}>
                                Approve
                            </span>
                            <span className={step === 'investing' ? 'font-semibold text-[hsl(var(--foreground))]' : ''}>
                                Invest
                            </span>
                        </div>

                        {approveTxHash && (
                            <a
                                href={getExplorerUrl('tx', approveTxHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-[hsl(var(--primary))] hover:underline"
                            >
                                View on Explorer <ExternalLink size={14} />
                            </a>
                        )}
                    </div>
                );

            case 'success':
                return (
                    <div className="py-8 space-y-6 text-center">
                        <div className="relative mx-auto w-20 h-20">
                            <CheckCircle2 size={80} className="text-green-500" />
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-2">Investment Successful!</h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                You have successfully invested Rp {formatIDRX(amountNum)} in {projectName}.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">Amount Invested</span>
                                <span className="font-bold">Rp {formatIDRX(amountNum)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[hsl(var(--muted-foreground))]">Expected Return</span>
                                <span className="font-semibold text-green-600">
                                    Rp {formatIDRX(expectedReturn)}
                                </span>
                            </div>
                        </div>

                        {investTxHash && (
                            <a
                                href={getExplorerUrl('tx', investTxHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-[hsl(var(--primary))] hover:underline"
                            >
                                View Transaction <ExternalLink size={14} />
                            </a>
                        )}

                        <Button className="w-full" onClick={handleClose}>
                            Done
                        </Button>
                    </div>
                );

            case 'error':
                return (
                    <div className="py-8 space-y-6 text-center">
                        <div className="relative mx-auto w-20 h-20">
                            <XCircle size={80} className="text-red-500" />
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-2">Transaction Failed</h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                {error?.message || 'Something went wrong. Please try again.'}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => {
                                    setStep('input');
                                    resetTx();
                                }}
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
                    <DialogTitle>Invest in {projectName}</DialogTitle>
                    <DialogDescription>
                        Invest using IDRX tokens on Base network.
                    </DialogDescription>
                </DialogHeader>

                {!isConnected ? (
                    <div className="py-8 text-center space-y-4">
                        <Wallet size={48} className="mx-auto text-[hsl(var(--muted-foreground))]" />
                        <p className="text-[hsl(var(--muted-foreground))]">
                            Please connect your wallet to invest.
                        </p>
                    </div>
                ) : (
                    renderStepContent()
                )}
            </DialogContent>
        </Dialog>
    );
}
