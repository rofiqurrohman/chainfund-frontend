import { Link } from 'react-router-dom';
import { MapPin, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RiskBadge } from '@/components/project/RiskBadge';
import { formatIDRX, calculateProgress } from '@/lib/utils';
import type { Project } from '@/types';

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const progress = calculateProgress(project.currentFunding, project.fundingTarget);

    return (
        <Card className="group overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={project.imageUrl}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3">
                    <RiskBadge risk={project.riskLevel} />
                </div>
                <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800">
                        {project.industry}
                    </span>
                </div>
                {project.isFunded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="px-4 py-2 rounded-full bg-green-500 text-white font-semibold text-sm">
                            ✓ Fully Funded
                        </span>
                    </div>
                )}
            </div>

            <CardContent className="p-5">
                {/* Title & Location */}
                <div className="mb-3">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-[hsl(var(--primary))] transition-colors">
                        {project.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
                        <MapPin size={14} />
                        <span>{project.location}</span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-4">
                    {project.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <TrendingUp size={16} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">ROI</p>
                            <p className="font-semibold text-green-600">{project.roiPercentage}%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Clock size={16} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Duration</p>
                            <p className="font-semibold">{project.durationMonths} months</p>
                        </div>
                    </div>
                </div>

                {/* Funding Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-[hsl(var(--muted-foreground))]">Funding Progress</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                        <span>Rp {formatIDRX(project.currentFunding)}</span>
                        <span>of Rp {formatIDRX(project.fundingTarget)}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {project.remainingDays > 0 ? `${project.remainingDays} days left` : 'Funding closed'}
                    </p>
                </div>
                <Button asChild size="sm" disabled={project.isFunded}>
                    <Link to={`/projects/${project.id}`}>
                        {project.isFunded ? 'View Details' : 'Invest Now'}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
