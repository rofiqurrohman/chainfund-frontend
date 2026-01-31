import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectCard } from '@/components/shared/ProjectCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useFundings, type Funding } from '@/hooks/useApi';
import type { RiskLevel, Industry } from '@/types';

export function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [industryFilter, setIndustryFilter] = useState<Industry | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'roi' | 'funding' | 'days'>('roi');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const industries: Industry[] = [
    'F&B',
    'Retail',
    'Agriculture',
    'Technology',
    'Manufacturing',
    'Services',
    'Healthcare',
    'Education',
  ];

  // Fetch fundings from API
  const { data, isLoading, error } = useFundings({
    limit: 100,
    industry: industryFilter !== 'ALL' ? industryFilter : undefined,
    riskLevel: riskFilter !== 'ALL' ? riskFilter : undefined,
    search: debouncedSearch || undefined,
  });

  // Transform API funding to Project type for ProjectCard
  const transformToProject = (funding: Funding) => ({
    id: funding.id,
    name: funding.name,
    description: funding.description,
    industry: funding.industry as Industry,
    location: funding.location,
    riskLevel: funding.riskLevel,
    fundingTarget: funding.fundingTarget,
    currentFunding: funding.currentFunding,
    minimumInvestment: funding.minimumInvestment,
    roiPercentage: funding.roiPercentage,
    durationMonths: funding.durationMonths,
    startDate: funding.startDate,
    endDate: funding.endDate,
    remainingDays: funding.remainingDays,
    imageUrl: funding.imageUrl,
    isActive: !!funding.contractAddress,
    // isActive: funding.isActive,
    isFunded: funding.isFunded,
    updates:
      funding.updates?.map((u) => ({
        id: u.id,
        date: u.date,
        title: u.title,
        content: u.content,
      })) || [],
    financialDetails: funding.financialDetails,
  });

  const filteredProjects = useMemo(() => {
    if (!data?.fundings) return [];

    let result = data.fundings.map(transformToProject).filter((project) => project.isActive);

    // Sort
    switch (sortBy) {
      case 'roi':
        result.sort((a, b) => b.roiPercentage - a.roiPercentage);
        break;
      case 'funding':
        result.sort((a, b) => b.currentFunding / b.fundingTarget - a.currentFunding / a.fundingTarget);
        break;
      case 'days':
        result.sort((a, b) => a.remainingDays - b.remainingDays);
        break;
    }

    return result;
  }, [data, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setRiskFilter('ALL');
    setIndustryFilter('ALL');
    setSortBy('roi');
  };

  const hasActiveFilters = searchQuery || riskFilter !== 'ALL' || industryFilter !== 'ALL';

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />

      <main className='flex-1'>
        {/* Header */}
        <section className='py-12 bg-[hsl(var(--muted))]/30 border-b border-[hsl(var(--border))]'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='max-w-2xl'>
              <h1 className='text-3xl font-bold mb-3'>Investment Marketplace</h1>
              <p className='text-[hsl(var(--muted-foreground))]'>
                Discover verified MSME projects with detailed financials and transparent returns.
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className='py-6 border-b border-[hsl(var(--border))] sticky top-16 z-30 bg-[hsl(var(--background))]/95 backdrop-blur-sm'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex flex-col lg:flex-row gap-4'>
              {/* Search */}
              <div className='relative flex-1 max-w-md'>
                <Search
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]'
                  size={18}
                />
                <Input
                  placeholder='Search projects...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>

              {/* Filters */}
              <div className='flex flex-wrap gap-3'>
                <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v as RiskLevel | 'ALL')}>
                  <SelectTrigger className='w-[140px]'>
                    <Filter size={16} className='mr-2' />
                    <SelectValue placeholder='Risk Level' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>All Risks</SelectItem>
                    <SelectItem value='LOW'>Low Risk</SelectItem>
                    <SelectItem value='MEDIUM'>Medium Risk</SelectItem>
                    <SelectItem value='HIGH'>High Risk</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={industryFilter} onValueChange={(v) => setIndustryFilter(v as Industry | 'ALL')}>
                  <SelectTrigger className='w-[160px]'>
                    <SelectValue placeholder='Industry' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>All Industries</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'roi' | 'funding' | 'days')}>
                  <SelectTrigger className='w-[160px]'>
                    <SelectValue placeholder='Sort by' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='roi'>Highest ROI</SelectItem>
                    <SelectItem value='funding'>Most Funded</SelectItem>
                    <SelectItem value='days'>Ending Soon</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant='ghost' size='sm' onClick={clearFilters} className='gap-2'>
                    <X size={16} />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className='py-8'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            {/* Loading state */}
            {isLoading && (
              <div className='flex items-center justify-center py-20'>
                <Loader2 className='animate-spin text-[hsl(var(--primary))]' size={32} />
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className='text-center py-20'>
                <div className='w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4'>
                  <X size={24} className='text-red-500' />
                </div>
                <h3 className='font-semibold text-lg mb-2'>Failed to load projects</h3>
                <p className='text-[hsl(var(--muted-foreground))] mb-4'>{(error as Error).message}</p>
                <Button variant='outline' onClick={() => window.location.reload()}>
                  Try again
                </Button>
              </div>
            )}

            {/* Results count */}
            {!isLoading && !error && (
              <>
                <div className='mb-6'>
                  <p className='text-sm text-[hsl(var(--muted-foreground))]'>
                    Showing <span className='font-medium text-[hsl(var(--foreground))]'>{filteredProjects.length}</span>{' '}
                    project{filteredProjects.length !== 1 && 's'}
                  </p>
                </div>

                {/* Grid */}
                {filteredProjects.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {filteredProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-20'>
                    <div className='w-16 h-16 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4'>
                      <Search size={24} className='text-[hsl(var(--muted-foreground))]' />
                    </div>
                    <h3 className='font-semibold text-lg mb-2'>No projects found</h3>
                    <p className='text-[hsl(var(--muted-foreground))] mb-4'>
                      Try adjusting your filters or search query.
                    </p>
                    <Button variant='outline' onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
