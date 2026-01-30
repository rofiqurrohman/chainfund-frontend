import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ExternalLink,
    CheckCircle2,
    Clock,
    TrendingUp,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useInvestments, type Investment } from '@/hooks/useApi';
import { formatIDRX, getStatusColor } from '@/lib/utils';

type InvestmentStatus = Investment['status'];

const statusIcons: Record<InvestmentStatus, typeof Clock> = {
    LOCKED: Clock,
    RUNNING: TrendingUp,
    PROFIT_GENERATING: TrendingUp,
    COMPLETED: CheckCircle2,
    FAILED: AlertCircle,
};

export function InvestmentsPage() {
    const [statusFilter, setStatusFilter] = useState<InvestmentStatus | 'ALL'>('ALL');
    const { data, isLoading, error } = useInvestments();

    const investments = data?.investments || [];

    const filteredInvestments = statusFilter === 'ALL'
        ? investments
        : investments.filter((inv) => inv.status === statusFilter);

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalExpectedReturn = investments.reduce((sum, inv) => sum + inv.expectedReturn, 0);
    const totalActualReturn = investments.reduce((sum, inv) => sum + (inv.actualReturn || 0), 0);

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-2">My Investments</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">
                        Track and manage all your investment positions.
                    </p>
                </div>
                <Button asChild variant="gradient">
                    <Link to="/projects">
                        <TrendingUp size={18} />
                        Explore Projects
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Total Invested</p>
                        <p className="text-2xl font-bold">Rp {formatIDRX(totalInvested)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Expected Return</p>
                        <p className="text-2xl font-bold text-green-600">Rp {formatIDRX(totalExpectedReturn)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Profit Received</p>
                        <p className="text-2xl font-bold text-[hsl(var(--primary))]">Rp {formatIDRX(totalActualReturn)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvestmentStatus | 'ALL')}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="LOCKED">Locked</SelectItem>
                        <SelectItem value="RUNNING">Running</SelectItem>
                        <SelectItem value="PROFIT_GENERATING">Profit Generating</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                </Select>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    {filteredInvestments.length} investment{filteredInvestments.length !== 1 && 's'}
                </span>
            </div>

            {/* Investment List */}
            <div className="space-y-4">
                {filteredInvestments.length > 0 ? (
                    filteredInvestments.map((investment) => {
                        const StatusIcon = statusIcons[investment.status];

                        return (
                            <Card key={investment.id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Main Info */}
                                        <div className="flex-1 p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <Link
                                                        to={`/projects/${investment.fundingId}`}
                                                        className="font-semibold text-lg hover:text-[hsl(var(--primary))] transition-colors inline-flex items-center gap-2"
                                                    >
                                                        {investment.projectName || 'Project'}
                                                        <ExternalLink size={16} />
                                                    </Link>
                                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                        Invested on {new Date(investment.investedAt).toLocaleDateString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(investment.status)}`}>
                                                    <StatusIcon size={14} />
                                                    {investment.status.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Invested</p>
                                                    <p className="font-semibold">Rp {formatIDRX(investment.amount)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Expected Return</p>
                                                    <p className="font-semibold text-green-600">Rp {formatIDRX(investment.expectedReturn)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Profit Received</p>
                                                    <p className="font-semibold text-[hsl(var(--primary))]">
                                                        Rp {formatIDRX(investment.actualReturn || 0)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Expected Profit</p>
                                                    <p className="font-semibold">
                                                        +{((investment.expectedReturn - investment.amount) / investment.amount * 100).toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {(investment.status === 'PROFIT_GENERATING' || investment.status === 'COMPLETED') && (
                                            <>
                                                <Separator orientation="vertical" className="hidden lg:block" />
                                                <Separator className="lg:hidden" />
                                                <div className="p-6 lg:w-48 flex items-center justify-center">
                                                    <Button className="w-full" disabled>
                                                        <CheckCircle2 size={16} />
                                                        {investment.status === 'COMPLETED' ? 'Claimed' : 'Claim Profit'}
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <TrendingUp size={48} className="mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
                            <h3 className="font-semibold text-lg mb-2">No investments found</h3>
                            <p className="text-[hsl(var(--muted-foreground))] mb-4">
                                {statusFilter === 'ALL'
                                    ? "You haven't made any investments yet."
                                    : `No investments with status "${statusFilter.replace('_', ' ')}".`
                                }
                            </p>
                            <Button asChild variant="gradient">
                                <Link to="/projects">Explore Projects</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
