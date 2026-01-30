import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Loader2,
    Edit2,
    Trash2,
    Eye,
    TrendingUp,
    Users,
    Calendar,
    AlertCircle,
    Rocket,
    CheckCircle2,
    ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useMyFundings, useDeleteFunding, type Funding } from '@/hooks/useApi';
import { formatIDRX, getRiskColor } from '@/lib/utils';
import { DeployCampaignModal } from '@/components/campaign/DeployCampaignModal';
import { api } from '@/services/api';
import { getExplorerUrl } from '@/lib/contracts/config';

export function MyFundingsPage() {
    const { data, isLoading, error, refetch } = useMyFundings();
    const deleteFunding = useDeleteFunding();
    const [deleteConfirm, setDeleteConfirm] = useState<Funding | null>(null);
    const [deployTarget, setDeployTarget] = useState<Funding | null>(null);

    const fundings = data?.fundings || [];

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await deleteFunding.mutateAsync(deleteConfirm.id);
            setDeleteConfirm(null);
            refetch();
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    const handleDeploySuccess = async (contractAddress: string) => {
        if (!deployTarget) return;

        try {
            await api.updateFundingContract(deployTarget.id, contractAddress);
            console.log('Contract address saved:', contractAddress);
            // Reset the deploy target to close modal and allow new deployments
            setDeployTarget(null);
            // Refresh the list to show updated contract status
            refetch();
        } catch (err) {
            console.error('Failed to save contract address:', err);
            // Still reset the modal even if save fails
            setDeployTarget(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-[hsl(var(--primary))]" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-2">My Fundings</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">
                        Manage your crowdfunding projects.
                    </p>
                </div>
                <Button asChild variant="gradient">
                    <Link to="/dashboard/my-fundings/create">
                        <Plus size={18} />
                        Create Funding
                    </Link>
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <AlertCircle className="text-red-500" size={20} />
                    <p className="text-red-500 text-sm">{(error as Error).message}</p>
                </div>
            )}

            {/* Fundings Grid */}
            {fundings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fundings.map((funding) => (
                        <Card key={funding.id} className="overflow-hidden">
                            {/* Image */}
                            <div className="h-32 relative">
                                <img
                                    src={funding.imageUrl || 'https://via.placeholder.com/400x200'}
                                    alt={funding.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${funding.isActive
                                            ? 'bg-green-500/90 text-white'
                                            : 'bg-gray-500/90 text-white'
                                        }`}>
                                        {funding.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(funding.riskLevel)}`}>
                                        {funding.riskLevel}
                                    </span>
                                </div>
                            </div>

                            <CardContent className="p-5">
                                <h3 className="font-semibold text-lg mb-2">{funding.name}</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-4">
                                    {funding.description}
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={14} className="text-[hsl(var(--primary))]" />
                                        <span className="text-sm font-medium">{funding.roiPercentage}% ROI</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-[hsl(var(--muted-foreground))]" />
                                        <span className="text-sm">{funding.durationMonths}mo</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-[hsl(var(--muted-foreground))]" />
                                        <span className="text-sm">{funding.remainingDays}d left</span>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-[hsl(var(--muted-foreground))]">Funding Progress</span>
                                        <span className="font-medium">
                                            {((funding.currentFunding / funding.fundingTarget) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={(funding.currentFunding / funding.fundingTarget) * 100}
                                        className="h-2"
                                    />
                                    <div className="flex justify-between text-xs mt-1 text-[hsl(var(--muted-foreground))]">
                                        <span>Rp {formatIDRX(funding.currentFunding)}</span>
                                        <span>Rp {formatIDRX(funding.fundingTarget)}</span>
                                    </div>
                                </div>

                                {/* Blockchain Status */}
                                <div className="mb-4 p-3 rounded-lg bg-[hsl(var(--muted))]">
                                    {funding.contractAddress ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-green-500" />
                                                <span className="text-sm font-medium text-green-500">On-Chain</span>
                                            </div>
                                            <a
                                                href={getExplorerUrl('address', funding.contractAddress)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
                                            >
                                                {funding.contractAddress.slice(0, 6)}...{funding.contractAddress.slice(-4)}
                                                <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[hsl(var(--muted-foreground))]">Not deployed to blockchain</span>
                                            <Button
                                                variant="gradient"
                                                size="sm"
                                                onClick={() => setDeployTarget(funding)}
                                            >
                                                <Rocket size={14} />
                                                Deploy
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" size="sm" className="flex-1">
                                        <Link to={`/projects/${funding.id}`}>
                                            <Eye size={14} />
                                            View
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm" className="flex-1">
                                        <Link to={`/dashboard/my-fundings/${funding.id}/edit`}>
                                            <Edit2 size={14} />
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDeleteConfirm(funding)}
                                        disabled={funding.currentFunding > 0 || !!funding.contractAddress}
                                        className="text-red-500 hover:bg-red-500/10"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4">
                            <Plus size={32} className="text-[hsl(var(--muted-foreground))]" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">No fundings yet</h3>
                        <p className="text-[hsl(var(--muted-foreground))] mb-6">
                            Create your first crowdfunding project to start raising capital.
                        </p>
                        <Button asChild variant="gradient">
                            <Link to="/dashboard/my-fundings/create">
                                <Plus size={18} />
                                Create Your First Funding
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Funding</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteFunding.isPending}
                        >
                            {deleteFunding.isPending ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Deploy Campaign Modal */}
            {deployTarget && (
                <DeployCampaignModal
                    isOpen={!!deployTarget}
                    onClose={() => setDeployTarget(null)}
                    funding={deployTarget}
                    onDeploySuccess={handleDeploySuccess}
                />
            )}
        </div>
    );
}

