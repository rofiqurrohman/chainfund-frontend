import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Clock, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatIDRX, calculateEstimatedProfit } from '@/lib/utils';

interface InvestmentSimulatorProps {
    project: {
        minimumInvestment: number;
        roiPercentage: number;
        durationMonths: number;
    };
}

export function InvestmentSimulator({ project }: InvestmentSimulatorProps) {
    const [investmentAmount, setInvestmentAmount] = useState<string>(
        project.minimumInvestment.toString()
    );

    const amount = useMemo(() => {
        const parsed = parseFloat(investmentAmount) || 0;
        return Math.max(0, parsed);
    }, [investmentAmount]);

    const estimatedProfit = useMemo(() => {
        return calculateEstimatedProfit(amount, project.roiPercentage, project.durationMonths);
    }, [amount, project.roiPercentage, project.durationMonths]);

    const totalReturn = amount + estimatedProfit;

    const monthlyProfit = project.durationMonths > 0
        ? estimatedProfit / project.durationMonths
        : 0;

    const isValidAmount = amount >= project.minimumInvestment;

    return (
        <Card className="border-2 border-[hsl(var(--primary))]/20">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator size={20} className="text-[hsl(var(--primary))]" />
                    Investment Simulator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Input */}
                <div className="space-y-2">
                    <Label htmlFor="investment-amount">Investment Amount (IDRX)</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                            Rp
                        </span>
                        <Input
                            id="investment-amount"
                            type="number"
                            value={investmentAmount}
                            onChange={(e) => setInvestmentAmount(e.target.value)}
                            className="pl-10"
                            min={project.minimumInvestment}
                            step={100000}
                        />
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Minimum: Rp {formatIDRX(project.minimumInvestment)}
                    </p>
                </div>

                {/* Quick Select */}
                <div className="flex flex-wrap gap-2">
                    {[1000000, 5000000, 10000000, 25000000].map((value) => (
                        <button
                            key={value}
                            onClick={() => setInvestmentAmount(value.toString())}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors"
                        >
                            Rp {formatIDRX(value)}
                        </button>
                    ))}
                </div>

                <Separator />

                {/* Results */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--muted))]">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={18} className="text-green-600" />
                            <span className="text-sm">Expected ROI</span>
                        </div>
                        <span className="font-semibold text-green-600">{project.roiPercentage}% p.a.</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--muted))]">
                        <div className="flex items-center gap-2">
                            <Clock size={18} className="text-blue-600" />
                            <span className="text-sm">Lock Period</span>
                        </div>
                        <span className="font-semibold">{project.durationMonths} months</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--muted))]">
                        <div className="flex items-center gap-2">
                            <Coins size={18} className="text-yellow-600" />
                            <span className="text-sm">Monthly Profit</span>
                        </div>
                        <span className="font-semibold">Rp {formatIDRX(monthlyProfit)}</span>
                    </div>
                </div>

                <Separator />

                {/* Summary */}
                <div className="p-4 rounded-xl gradient-primary text-white">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm opacity-90">Estimated Profit</span>
                        <span className="font-bold text-lg">+ Rp {formatIDRX(estimatedProfit)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm opacity-90">Total Return</span>
                        <span className="font-bold text-xl">Rp {formatIDRX(totalReturn)}</span>
                    </div>
                </div>

                {!isValidAmount && amount > 0 && (
                    <p className="text-sm text-red-500 text-center">
                        Minimum investment is Rp {formatIDRX(project.minimumInvestment)}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
