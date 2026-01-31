import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Image, DollarSign, Calendar, MapPin, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateFunding, useUpdateFunding, useFunding, type Funding } from '@/hooks/useApi';

interface FundingFormData {
  name: string;
  description: string;
  industry: string;
  location: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  fundingTarget: number;
  minimumInvestment: number;
  roiPercentage: number;
  durationMonths: number;
  remainingDays: number;
  imageUrl: string;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netProfit: number;
  profitMargin: number;
  businessAge: number;
}

const industries = [
  'F&B',
  'Retail',
  'Agriculture',
  'Technology',
  'Manufacturing',
  'Services',
  'Healthcare',
  'Education',
];

export function CreateFundingPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = !!id;

  const { data: existingFunding } = useFunding(id || '');

  const createFunding = useCreateFunding();
  const updateFunding = useUpdateFunding();

  const [form, setForm] = useState<FundingFormData>({
    name: '',
    description: '',
    industry: 'F&B',
    location: '',
    riskLevel: 'MEDIUM',
    fundingTarget: 100000000,
    minimumInvestment: 1000000,
    roiPercentage: 15,
    durationMonths: 12,
    remainingDays: 30,
    imageUrl: '',
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    businessAge: 0,
  });

  // Populate form when editing
  useState(() => {
    if (existingFunding?.funding) {
      const f = existingFunding.funding;
      setForm({
        name: f.name,
        description: f.description,
        industry: f.industry,
        location: f.location,
        riskLevel: f.riskLevel,
        fundingTarget: f.fundingTarget,
        minimumInvestment: f.minimumInvestment,
        roiPercentage: f.roiPercentage,
        durationMonths: f.durationMonths,
        remainingDays: f.remainingDays,
        imageUrl: f.imageUrl,
        monthlyRevenue: f.financialDetails?.monthlyRevenue || 0,
        monthlyExpenses: f.financialDetails?.monthlyExpenses || 0,
        netProfit: f.financialDetails?.netProfit || 0,
        profitMargin: f.financialDetails?.profitMargin || 0,
        businessAge: f.financialDetails?.businessAge || 0,
      });
    }
  });

  const updateField = <K extends keyof FundingFormData>(key: K, value: FundingFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: Partial<Funding> = {
      name: form.name,
      description: form.description,
      industry: form.industry,
      location: form.location,
      riskLevel: form.riskLevel,
      fundingTarget: form.fundingTarget,
      minimumInvestment: form.minimumInvestment,
      roiPercentage: form.roiPercentage,
      durationMonths: form.durationMonths,
      remainingDays: form.remainingDays,
      imageUrl: form.imageUrl,
      financialDetails: {
        monthlyRevenue: form.monthlyRevenue,
        monthlyExpenses: form.monthlyExpenses,
        netProfit: form.netProfit,
        profitMargin: form.profitMargin,
        businessAge: form.businessAge,
      },
    };

    try {
      if (isEdit && id) {
        await updateFunding.mutateAsync({ id, data });
      } else {
        await createFunding.mutateAsync(data);
      }
      navigate('/dashboard/my-fundings');
    } catch (err) {
      console.error('Failed to save funding:', err);
    }
  };

  const isSubmitting = createFunding.isPending || updateFunding.isPending;

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className='text-2xl font-bold mb-1'>{isEdit ? 'Edit Funding' : 'Create New Funding'}</h1>
          <p className='text-[hsl(var(--muted-foreground))]'>
            {isEdit ? 'Update your funding details' : 'Set up your crowdfunding project'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 size={20} />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Project Name *</Label>
                <Input
                  id='name'
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder='e.g., Warung Kopi Nusantara'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='industry'>Industry *</Label>
                <Select value={form.industry} onValueChange={(v) => updateField('industry', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description *</Label>
              <textarea
                id='description'
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder='Describe your project, goals, and how funds will be used...'
                className='w-full min-h-[120px] px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]'
                required
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='location'>Location</Label>
                <div className='relative'>
                  <MapPin
                    size={16}
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]'
                  />
                  <Input
                    id='location'
                    value={form.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder='e.g., Jakarta'
                    className='pl-9'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='riskLevel'>Risk Level</Label>
                <Select
                  value={form.riskLevel}
                  onValueChange={(v) => updateField('riskLevel', v as 'LOW' | 'MEDIUM' | 'HIGH')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='LOW'>Low Risk</SelectItem>
                    <SelectItem value='MEDIUM'>Medium Risk</SelectItem>
                    <SelectItem value='HIGH'>High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='imageUrl'>Image URL</Label>
              <div className='relative'>
                <Image
                  size={16}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]'
                />
                <Input
                  id='imageUrl'
                  value={form.imageUrl}
                  onChange={(e) => updateField('imageUrl', e.target.value)}
                  placeholder='https://...'
                  className='pl-9'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Funding Details */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign size={20} />
              Funding Details
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='fundingTarget'>Funding Target (Rp) *</Label>
                <Input
                  id='fundingTarget'
                  type='number'
                  value={form.fundingTarget}
                  onChange={(e) => updateField('fundingTarget', parseInt(e.target.value) || 0)}
                  min={1000000}
                  step={1000000}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='minimumInvestment'>Minimum Investment (Rp) *</Label>
                <Input
                  id='minimumInvestment'
                  type='number'
                  value={form.minimumInvestment}
                  onChange={(e) => updateField('minimumInvestment', parseInt(e.target.value) || 0)}
                  min={100000}
                  step={100000}
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='roiPercentage'>Expected ROI (%)</Label>
                <Input
                  id='roiPercentage'
                  type='number'
                  value={form.roiPercentage}
                  onChange={(e) => updateField('roiPercentage', parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                  step={0.5}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='durationMonths'>Duration (Months)</Label>
                <div className='relative'>
                  <Calendar
                    size={16}
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]'
                  />
                  <Input
                    id='durationMonths'
                    type='number'
                    value={form.durationMonths}
                    onChange={(e) => updateField('durationMonths', parseInt(e.target.value) || 0)}
                    min={1}
                    max={60}
                    className='pl-9'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='remainingDays'>Funding Period (Days)</Label>
                <Input
                  id='remainingDays'
                  type='number'
                  value={form.remainingDays}
                  onChange={(e) => updateField('remainingDays', parseInt(e.target.value) || 0)}
                  min={1}
                  max={365}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 size={20} />
              Financial Details (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='monthlyRevenue'>Monthly Revenue (Rp)</Label>
                <Input
                  id='monthlyRevenue'
                  type='number'
                  value={form.monthlyRevenue}
                  onChange={(e) => updateField('monthlyRevenue', parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='monthlyExpenses'>Monthly Expenses (Rp)</Label>
                <Input
                  id='monthlyExpenses'
                  type='number'
                  value={form.monthlyExpenses}
                  onChange={(e) => updateField('monthlyExpenses', parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='businessAge'>Business Age (Months)</Label>
                <Input
                  id='businessAge'
                  type='number'
                  value={form.businessAge}
                  onChange={(e) => updateField('businessAge', parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className='flex gap-4 justify-end'>
          <Button type='button' variant='outline' onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type='submit' variant='gradient' disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={18} className='animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEdit ? 'Update Funding' : 'Create Funding'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
