import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Users,
    Building2,
    TrendingUp,
    Clock,
    BarChart3,
    FileText,
    Bell,
    CheckCircle2,
    Loader2,
    ExternalLink,
    LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RiskBadge } from '@/components/project/RiskBadge';
import { InvestmentSimulator } from '@/components/project/InvestmentSimulator';
import { InvestModal } from '@/components/project/InvestModal';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { formatIDRX, calculateProgress } from '@/lib/utils';
import { useCrowdfunding } from '@/hooks/useCrowdfunding';
import { getExplorerUrl } from '@/lib/contracts/config';
import { useAuth } from '@/contexts/AuthContext';
import { useFunding } from '@/hooks/useApi';

export function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading: isLoadingProject, error } = useFunding(id || '');
    const project = data?.funding;
    const { invest, isLoading } = useCrowdfunding();
    const { isAuthenticated, login } = useAuth();

    const [investAmount, setInvestAmount] = useState('');
    const [investSuccess, setInvestSuccess] = useState(false);
    const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);

    // Loading state
    if (isLoadingProject) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-[hsl(var(--primary))]" />
                </main>
                <Footer />
            </div>
        );
    }

    // Error or not found
    if (!project || error) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">
                            {error ? 'Error Loading Project' : 'Project Not Found'}
                        </h1>
                        <Button asChild>
                            <Link to="/projects">Back to Marketplace</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const progress = calculateProgress(project.currentFunding, project.fundingTarget);
    const hasContractAddress = !!project.contractAddress;

    // Handler for legacy (mock) investment
    const handleInvest = async () => {
        const amount = parseFloat(investAmount);
        if (amount >= project.minimumInvestment) {
            const success = await invest(project.id, amount);
            if (success) {
                setInvestSuccess(true);
                setTimeout(() => setInvestSuccess(false), 3000);
            }
        }
    };

    // Handler for blockchain investment
    const handleBlockchainInvest = () => {
        setIsInvestModalOpen(true);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Breadcrumb */}
                <div className="border-b border-[hsl(var(--border))]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <Link
                            to="/projects"
                            className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to Marketplace
                        </Link>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Header */}
                            <div>
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <RiskBadge risk={project.riskLevel} size="lg" />
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-[hsl(var(--muted))]">
                                        {project.industry}
                                    </span>
                                    {project.isFunded && (
                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-600">
                                            ✓ Fully Funded
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl font-bold mb-3">{project.name}</h1>

                                <div className="flex flex-wrap items-center gap-4 text-[hsl(var(--muted-foreground))]">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={16} />
                                        {project.location}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Building2 size={16} />
                                        {project.financialDetails.businessAge} months operating
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={16} />
                                        {project.durationMonths} months duration
                                    </span>
                                </div>
                            </div>

                            {/* Image */}
                            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden">
                                <img
                                    src={project.imageUrl}
                                    alt={project.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Tabs */}
                            <Tabs defaultValue="overview">
                                <TabsList className="w-full justify-start mb-6 overflow-x-auto">
                                    <TabsTrigger value="overview" className="gap-2">
                                        <FileText size={16} />
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger value="financial" className="gap-2">
                                        <BarChart3 size={16} />
                                        Financials
                                    </TabsTrigger>
                                    <TabsTrigger value="risk" className="gap-2">
                                        <TrendingUp size={16} />
                                        Risk Analysis
                                    </TabsTrigger>
                                    <TabsTrigger value="updates" className="gap-2">
                                        <Bell size={16} />
                                        Updates
                                        {(project.updates?.length || 0) > 0 && (
                                            <span className="ml-1 w-5 h-5 rounded-full bg-[hsl(var(--primary))] text-white text-xs flex items-center justify-center">
                                                {project.updates?.length}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>About This Project</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                                                {project.description}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Investment Highlights</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--muted))]">
                                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                                        <TrendingUp className="text-green-600" size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Expected ROI</p>
                                                        <p className="font-semibold text-green-600">{project.roiPercentage}% p.a.</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--muted))]">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                        <Clock className="text-blue-600" size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Lock Period</p>
                                                        <p className="font-semibold">{project.durationMonths} months</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--muted))]">
                                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                                        <Users className="text-purple-600" size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Min. Investment</p>
                                                        <p className="font-semibold">Rp {formatIDRX(project.minimumInvestment)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--muted))]">
                                                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                                                        <Calendar className="text-yellow-600" size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Funding Ends</p>
                                                        <p className="font-semibold">
                                                            {project.remainingDays > 0 ? `${project.remainingDays} days` : 'Closed'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="financial" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Financial Overview</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center p-4 rounded-xl bg-[hsl(var(--muted))]">
                                                    <span className="text-[hsl(var(--muted-foreground))]">Monthly Revenue</span>
                                                    <span className="font-semibold">Rp {formatIDRX(project.financialDetails.monthlyRevenue)}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-4 rounded-xl bg-[hsl(var(--muted))]">
                                                    <span className="text-[hsl(var(--muted-foreground))]">Monthly Expenses</span>
                                                    <span className="font-semibold">Rp {formatIDRX(project.financialDetails.monthlyExpenses)}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-4 rounded-xl bg-green-500/10">
                                                    <span className="text-green-600">Net Monthly Profit</span>
                                                    <span className="font-semibold text-green-600">Rp {formatIDRX(project.financialDetails.netProfit)}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-4 rounded-xl bg-[hsl(var(--muted))]">
                                                    <span className="text-[hsl(var(--muted-foreground))]">Profit Margin</span>
                                                    <span className="font-semibold">{project.financialDetails.profitMargin}%</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <InvestmentSimulator project={project} />
                                </TabsContent>

                                <TabsContent value="risk" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                Risk Assessment
                                                <RiskBadge risk={project.riskLevel} />
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <h4 className="font-medium mb-2">Business Risk Factors</h4>
                                                <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Operating for {project.financialDetails.businessAge} months with consistent revenue</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Profit margin of {project.financialDetails.profitMargin}% exceeds industry average</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Verified financial statements and business documentation</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <Separator />
                                            <div>
                                                <h4 className="font-medium mb-2">Mitigation Measures</h4>
                                                <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle2 size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Smart contract ensures automated fund management</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle2 size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Refund mechanism if funding target not reached</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle2 size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Regular progress updates and financial reporting</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="updates" className="space-y-4">
                                    {(project.updates?.length || 0) > 0 ? (
                                        project.updates?.map((update) => (
                                            <Card key={update.id}>
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] mb-2">
                                                        <Calendar size={14} />
                                                        {new Date(update.date).toLocaleDateString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </div>
                                                    <h4 className="font-semibold mb-2">{update.title}</h4>
                                                    <p className="text-[hsl(var(--muted-foreground))]">{update.content}</p>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <Card>
                                            <CardContent className="p-8 text-center">
                                                <Bell size={48} className="mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
                                                <h4 className="font-semibold mb-2">No Updates Yet</h4>
                                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                    Project updates will appear here once the funding is complete.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar - Sticky Investment Panel */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Funding Progress Card */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="mb-4">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-2xl font-bold">Rp {formatIDRX(project.currentFunding)}</span>
                                            </div>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                of Rp {formatIDRX(project.fundingTarget)} target
                                            </p>
                                        </div>

                                        <Progress value={progress} className="h-3 mb-4" />

                                        <div className="grid grid-cols-2 gap-4 text-center text-sm">
                                            <div>
                                                <p className="font-semibold">{progress.toFixed(1)}%</p>
                                                <p className="text-[hsl(var(--muted-foreground))]">Funded</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">{project.remainingDays}</p>
                                                <p className="text-[hsl(var(--muted-foreground))]">Days Left</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Invest Card */}
                                {!project.isFunded && project.remainingDays > 0 && (
                                    <Card className="border-2 border-[hsl(var(--primary))]/20">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                Invest Now
                                                {hasContractAddress && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-normal">
                                                        On-Chain
                                                    </span>
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Contract Info */}
                                            {hasContractAddress && (
                                                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-[hsl(var(--muted-foreground))]">Contract</span>
                                                        <a
                                                            href={getExplorerUrl('address', project.contractAddress!)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-blue-600 hover:underline font-mono text-xs"
                                                        >
                                                            {project.contractAddress?.slice(0, 6)}...{project.contractAddress?.slice(-4)}
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Investment Input - only show for legacy investments */}
                                            {!hasContractAddress && (
                                                <>
                                                    {isAuthenticated ? (
                                                        <>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="invest-amount">Investment Amount (IDRX)</Label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                                                                        Rp
                                                                    </span>
                                                                    <Input
                                                                        id="invest-amount"
                                                                        type="number"
                                                                        value={investAmount}
                                                                        onChange={(e) => setInvestAmount(e.target.value)}
                                                                        className="pl-10"
                                                                        placeholder={project.minimumInvestment.toString()}
                                                                        min={project.minimumInvestment}
                                                                    />
                                                                </div>
                                                                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                                                    Min: Rp {formatIDRX(project.minimumInvestment)}
                                                                </p>
                                                            </div>

                                                            <Button
                                                                className="w-full"
                                                                size="lg"
                                                                variant="gradient"
                                                                onClick={handleInvest}
                                                                disabled={isLoading || !investAmount || parseFloat(investAmount) < project.minimumInvestment}
                                                            >
                                                                {isLoading ? (
                                                                    <>
                                                                        <Loader2 size={18} className="animate-spin" />
                                                                        Processing...
                                                                    </>
                                                                ) : investSuccess ? (
                                                                    <>
                                                                        <CheckCircle2 size={18} />
                                                                        Investment Successful!
                                                                    </>
                                                                ) : (
                                                                    'Confirm Investment'
                                                                )}
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                                                <p className="mb-2">Min Investment: <strong>Rp {formatIDRX(project.minimumInvestment)}</strong></p>
                                                                <p>ROI: <strong className="text-green-600">{project.roiPercentage}%</strong> in {project.durationMonths} months</p>
                                                            </div>
                                                            <Button
                                                                className="w-full"
                                                                size="lg"
                                                                variant="gradient"
                                                                onClick={login}
                                                            >
                                                                <LogIn size={18} />
                                                                Login to Invest
                                                            </Button>
                                                        </>
                                                    )}
                                                </>
                                            )}

                                            {/* Blockchain Investment Button */}
                                            {hasContractAddress && (
                                                <>
                                                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                                        <p className="mb-2">Min Investment: <strong>Rp {formatIDRX(project.minimumInvestment)}</strong></p>
                                                        <p>ROI: <strong className="text-green-600">{project.roiPercentage}%</strong> in {project.durationMonths} months</p>
                                                    </div>

                                                    {isAuthenticated ? (
                                                        <Button
                                                            className="w-full"
                                                            size="lg"
                                                            variant="gradient"
                                                            onClick={handleBlockchainInvest}
                                                        >
                                                            Invest with IDRX
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            className="w-full"
                                                            size="lg"
                                                            variant="gradient"
                                                            onClick={login}
                                                        >
                                                            <LogIn size={18} />
                                                            Login to Invest
                                                        </Button>
                                                    )}
                                                </>
                                            )}

                                            <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
                                                {hasContractAddress 
                                                    ? 'Investment secured by smart contract on Base network.'
                                                    : 'By investing, you agree to our Terms of Service and Risk Disclosure.'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {project.isFunded && (
                                    <Card className="border-green-500/20 bg-green-500/5">
                                        <CardContent className="p-6 text-center">
                                            <CheckCircle2 size={48} className="mx-auto mb-4 text-green-600" />
                                            <h4 className="font-semibold text-lg mb-2">Funding Complete!</h4>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                This project has reached its funding target. Stay tuned for updates.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Invest Modal for blockchain investments */}
            {hasContractAddress && (
                <InvestModal
                    isOpen={isInvestModalOpen}
                    onClose={() => setIsInvestModalOpen(false)}
                    fundingId={project.id}
                    campaignAddress={project.contractAddress as `0x${string}`}
                    projectName={project.name}
                    minimumInvestment={project.minimumInvestment}
                    roiPercentage={project.roiPercentage}
                    durationMonths={project.durationMonths}
                />
            )}
        </div>
    );
}

