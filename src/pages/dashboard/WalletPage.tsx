import { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Loader2,
  Copy,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useAuth } from '@/contexts/AuthContext';
import { formatIDRX, shortenAddress } from '@/lib/utils';

export function WalletPage() {
  const { walletAddress, user } = useAuth();
  const { balance, stats, transactions, isLoading, isProcessing, error, deposit, withdraw, refreshBalance } =
    useWalletBalance();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [activeTab, setActiveTab] = useState('deposit');
  const [success, setSuccess] = useState<string | null>(null);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      const result = await deposit(amount);
      if (result) {
        setSuccess('Deposit submitted! Waiting for confirmation...');
        setDepositAmount('');
        setTimeout(() => setSuccess(null), 5000);
      }
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= balance) {
      const result = await withdraw(amount);
      if (result) {
        setSuccess('Withdrawal successful!');
        setWithdrawAmount('');
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
    }
  };

  const displayAddress = user?.walletAddress || walletAddress || '0x...';

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold mb-2'>Wallet</h1>
          <p className='text-[hsl(var(--muted-foreground))]'>Manage your IDRX balance and transactions.</p>
        </div>
        <Button variant='outline' onClick={refreshBalance} disabled={isLoading}>
          {isLoading ? <Loader2 size={16} className='animate-spin' /> : 'Refresh'}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className='p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3'>
          <AlertCircle className='text-red-500' size={20} />
          <p className='text-red-500 text-sm'>{error}</p>
        </div>
      )}

      {/* Balance Card */}
      <Card className='gradient-primary text-white'>
        <CardContent className='p-8'>
          <div className='flex items-start justify-between mb-6'>
            <div>
              <p className='text-white/80 mb-2'>Platform Balance</p>
              <p className='text-4xl font-bold'>Rp {formatIDRX(balance)}</p>
              <p className='text-white/60 text-sm mt-1'>IDRX on Base Network</p>
            </div>
            <div className='w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center'>
              <Wallet size={28} />
            </div>
          </div>

          {walletAddress && (
            <div className='flex items-center gap-2 p-3 rounded-xl bg-white/10'>
              <span className='text-sm text-white/80 flex-1 font-mono'>{shortenAddress(displayAddress)}</span>
              <Button
                size='icon'
                variant='ghost'
                className='h-8 w-8 text-white/80 hover:text-white hover:bg-white/10'
                onClick={copyAddress}
              >
                <Copy size={16} />
              </Button>
              <Button
                size='icon'
                variant='ghost'
                className='h-8 w-8 text-white/80 hover:text-white hover:bg-white/10'
                asChild
              >
                <a
                  href={`https://sepolia.basescan.org/address/${user?.walletAddress || walletAddress}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <ExternalLink size={16} />
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-6 flex items-center gap-4'>
            <div className='w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center'>
              <ArrowDownLeft className='text-green-600' size={24} />
            </div>
            <div>
              <p className='text-sm text-[hsl(var(--muted-foreground))]'>Total Deposited</p>
              <p className='text-xl font-bold'>Rp {formatIDRX(stats.totalDeposited)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-6 flex items-center gap-4'>
            <div className='w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center'>
              <ArrowUpRight className='text-red-600' size={24} />
            </div>
            <div>
              <p className='text-sm text-[hsl(var(--muted-foreground))]'>Total Withdrawn</p>
              <p className='text-xl font-bold'>Rp {formatIDRX(stats.totalWithdrawn)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-6 flex items-center gap-4'>
            <div className='w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center'>
              <Clock className='text-yellow-600' size={24} />
            </div>
            <div>
              <p className='text-sm text-[hsl(var(--muted-foreground))]'>Pending</p>
              <p className='text-xl font-bold'>{stats.pendingTransactions} transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deposit/Withdraw */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Transfer Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className='w-full mb-6'>
                <TabsTrigger value='deposit' className='flex-1 gap-2'>
                  <ArrowDownLeft size={16} />
                  Deposit
                </TabsTrigger>
                <TabsTrigger value='withdraw' className='flex-1 gap-2'>
                  <ArrowUpRight size={16} />
                  Withdraw
                </TabsTrigger>
              </TabsList>

              <TabsContent value='deposit' className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='deposit-amount'>Amount (IDRX)</Label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]'>
                      Rp
                    </span>
                    <Input
                      id='deposit-amount'
                      type='number'
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className='pl-10'
                      placeholder='Enter amount'
                    />
                  </div>
                </div>

                <div className='flex flex-wrap gap-2'>
                  {[1000000, 5000000, 10000000, 25000000].map((value) => (
                    <button
                      key={value}
                      onClick={() => setDepositAmount(value.toString())}
                      className='px-3 py-1.5 rounded-lg text-xs font-medium border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors'
                    >
                      Rp {formatIDRX(value)}
                    </button>
                  ))}
                </div>

                <Button
                  className='w-full'
                  size='lg'
                  onClick={handleDeposit}
                  disabled={isProcessing || !depositAmount || !walletAddress}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className='animate-spin' />
                      Processing...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 size={18} />
                      {success}
                    </>
                  ) : (
                    <>
                      <ArrowDownLeft size={18} />
                      Deposit IDRX
                    </>
                  )}
                </Button>

                <p className='text-xs text-center text-[hsl(var(--muted-foreground))]'>
                  Transfer IDRX from your wallet to platform.
                </p>
              </TabsContent>

              <TabsContent value='withdraw' className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='withdraw-amount'>Amount (IDRX)</Label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]'>
                      Rp
                    </span>
                    <Input
                      id='withdraw-amount'
                      type='number'
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className='pl-10'
                      placeholder='Enter amount'
                      max={balance}
                    />
                  </div>
                  <p className='text-xs text-[hsl(var(--muted-foreground))]'>Available: Rp {formatIDRX(balance)}</p>
                </div>

                <div className='flex flex-wrap gap-2'>
                  {[0.25, 0.5, 0.75, 1].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => setWithdrawAmount(Math.floor(balance * percent).toString())}
                      className='px-3 py-1.5 rounded-lg text-xs font-medium border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors'
                    >
                      {percent * 100}%
                    </button>
                  ))}
                </div>

                <Button
                  className='w-full'
                  size='lg'
                  variant='outline'
                  onClick={handleWithdraw}
                  disabled={isProcessing || !withdrawAmount || parseFloat(withdrawAmount) > balance}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className='animate-spin' />
                      Processing...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 size={18} />
                      {success}
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={18} />
                      Withdraw IDRX
                    </>
                  )}
                </Button>

                <p className='text-xs text-center text-[hsl(var(--muted-foreground))]'>
                  Funds will be sent to your connected wallet.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='animate-spin text-[hsl(var(--muted-foreground))]' size={24} />
              </div>
            ) : transactions.length > 0 ? (
              <div className='space-y-3'>
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className='flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--muted))]'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tx.type === 'DEPOSIT' || tx.type === 'PROFIT'
                            ? 'bg-green-500/10 text-green-600'
                            : tx.type === 'WITHDRAWAL' || tx.type === 'INVESTMENT'
                              ? 'bg-red-500/10 text-red-600'
                              : 'bg-yellow-500/10 text-yellow-600'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' || tx.type === 'PROFIT' ? (
                          <ArrowDownLeft size={18} />
                        ) : (
                          <ArrowUpRight size={18} />
                        )}
                      </div>
                      <div>
                        <p className='font-medium text-sm capitalize'>{tx.type.replace('_', ' ').toLowerCase()}</p>
                        <p className='text-xs text-[hsl(var(--muted-foreground))]'>
                          {new Date(tx.timestamp).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p
                        className={`font-semibold text-sm ${
                          tx.type === 'DEPOSIT' || tx.type === 'PROFIT' || tx.type === 'REFUND'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' || tx.type === 'PROFIT' || tx.type === 'REFUND' ? '+' : '-'}
                        Rp {formatIDRX(tx.amount)}
                      </p>
                      <p className='text-xs text-[hsl(var(--muted-foreground))] capitalize'>
                        {tx.status.toLowerCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8 text-[hsl(var(--muted-foreground))]'>
                <p>No transactions yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
