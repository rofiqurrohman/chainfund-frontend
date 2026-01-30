import {
    TrendingUp,
    Wallet,
    PiggyBank,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboardStats, useEarningsData, useInvestments } from '@/hooks/useApi';
import { formatIDRX, getStatusColor } from '@/lib/utils';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export function DashboardOverview() {
    const { data: statsData, isLoading: isLoadingStats } = useDashboardStats();
    const { data: earningsData, isLoading: isLoadingEarnings } = useEarningsData();
    const { data: investmentsData, isLoading: isLoadingInvestments } = useInvestments();

    const stats = statsData?.stats;
    const chartData = earningsData?.earnings || [];
    const investments = investmentsData?.investments || [];

    const activeInvestments = investments.filter(
        (inv) => inv.status === 'RUNNING' || inv.status === 'PROFIT_GENERATING' || inv.status === 'LOCKED'
    );

    const statCards = [
        {
            title: 'Portfolio Value',
            value: stats ? `Rp ${formatIDRX(stats.totalValue)}` : '-',
            change: stats?.averageROI ? `+${stats.averageROI}% avg ROI` : '',
            isPositive: true,
            icon: PiggyBank,
            color: 'bg-purple-500/10 text-purple-600',
        },
        {
            title: 'Total Invested',
            value: stats ? `Rp ${formatIDRX(stats.totalInvested)}` : '-',
            change: `${stats?.activeInvestments || 0} active`,
            isPositive: true,
            icon: Wallet,
            color: 'bg-blue-500/10 text-blue-600',
        },
        {
            title: 'Total Earnings',
            value: stats ? `Rp ${formatIDRX(stats.totalEarnings)}` : '-',
            change: stats?.completedInvestments ? `${stats.completedInvestments} completed` : '',
            isPositive: true,
            icon: TrendingUp,
            color: 'bg-green-500/10 text-green-600',
        },
    ];

    const isLoading = isLoadingStats || isLoadingEarnings || isLoadingInvestments;

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
                    <h1 className="text-2xl font-bold mb-2">Dashboard Overview</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">
                        Welcome back! Here's your investment summary.
                    </p>
                </div>
                <Button asChild variant="gradient">
                    <Link to="/dashboard/my-fundings">
                        <Plus size={18} />
                        Create Funding
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        {stat.isPositive ? (
                                            <ArrowUpRight size={16} className="text-green-500" />
                                        ) : (
                                            <ArrowDownRight size={16} className="text-red-500" />
                                        )}
                                        <span className={`text-sm ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                </div>
                                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Chart */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Earnings Overview</CardTitle>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))]" />
                            <span className="text-[hsl(var(--muted-foreground))]">Earnings</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[hsl(var(--accent))]" />
                            <span className="text-[hsl(var(--muted-foreground))]">Invested</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="month"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickFormatter={(value) => `${value / 1000000}M`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                        }}
                                        formatter={(value: number) => [`Rp ${formatIDRX(value)}`, '']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="earnings"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        dot={{ fill: 'hsl(var(--primary))' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="invested"
                                        stroke="hsl(var(--accent))"
                                        strokeWidth={2}
                                        dot={{ fill: 'hsl(var(--accent))' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">
                                <p>No earnings data yet. Start investing to track your progress!</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Investments Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Investments */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Active Investments</CardTitle>
                        <Button asChild variant="ghost" size="sm">
                            <Link to="/dashboard/investments">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {activeInvestments.length > 0 ? (
                            <div className="space-y-4">
                                {activeInvestments.slice(0, 3).map((investment) => (
                                    <div
                                        key={investment.id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-[hsl(var(--muted))]"
                                    >
                                        <div>
                                            <p className="font-medium mb-1">{investment.projectName}</p>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                Invested: Rp {formatIDRX(investment.amount)}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(investment.status)}`}>
                                            {investment.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                                <p>No active investments yet.</p>
                                <Button asChild variant="link" className="mt-2">
                                    <Link to="/projects">Explore Projects</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button asChild className="w-full justify-start gap-3" variant="outline" size="lg">
                            <Link to="/projects">
                                <TrendingUp size={20} />
                                Browse New Projects
                            </Link>
                        </Button>
                        <Button asChild className="w-full justify-start gap-3" variant="outline" size="lg">
                            <Link to="/dashboard/wallet">
                                <Wallet size={20} />
                                Manage Wallet
                            </Link>
                        </Button>
                        <Button asChild className="w-full justify-start gap-3" variant="outline" size="lg">
                            <Link to="/dashboard/investments">
                                <PiggyBank size={20} />
                                View All Investments
                            </Link>
                        </Button>
                        <Button asChild className="w-full justify-start gap-3" variant="gradient" size="lg">
                            <Link to="/dashboard/my-fundings">
                                <Plus size={20} />
                                Create Your Funding
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
