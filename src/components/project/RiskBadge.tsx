import { Shield, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/types';

interface RiskBadgeProps {
    risk: RiskLevel;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const riskConfig: Record<RiskLevel, {
    label: string;
    color: string;
    bgColor: string;
    icon: typeof Shield;
}> = {
    LOW: {
        label: 'Low Risk',
        color: 'text-green-600',
        bgColor: 'bg-green-500/10 border-green-500/20',
        icon: Shield,
    },
    MEDIUM: {
        label: 'Medium Risk',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500/10 border-yellow-500/20',
        icon: AlertTriangle,
    },
    HIGH: {
        label: 'High Risk',
        color: 'text-red-600',
        bgColor: 'bg-red-500/10 border-red-500/20',
        icon: AlertCircle,
    },
};

const sizeConfig = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
};

export function RiskBadge({ risk, showLabel = true, size = 'md' }: RiskBadgeProps) {
    const config = riskConfig[risk];
    const Icon = config.icon;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full border font-medium',
                config.bgColor,
                config.color,
                sizeConfig[size]
            )}
        >
            <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
            {showLabel && <span>{config.label}</span>}
        </span>
    );
}
