import { useAuth } from '@/contexts/AuthContext';
import { Wallet, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, login } = useAuth();

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary))]/20 flex items-center justify-center mx-auto mb-4">
                            <Loader2 size={32} className="text-[hsl(var(--primary))] animate-spin" />
                        </div>
                        <p className="text-[hsl(var(--muted-foreground))]">Loading...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Show login page if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full">
                        <CardContent className="p-8 text-center">
                            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                                <Shield size={40} className="text-white" />
                            </div>

                            <h1 className="text-2xl font-bold mb-3">Masuk ke Akun Anda</h1>
                            <p className="text-[hsl(var(--muted-foreground))] mb-6">
                                Masuk dengan email atau wallet untuk mengakses dashboard investor Anda.
                            </p>

                            <Button
                                onClick={login}
                                variant="gradient"
                                size="xl"
                                className="w-full"
                            >
                                <Wallet size={20} />
                                Masuk Sekarang
                                <ArrowRight size={20} />
                            </Button>

                            <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]">
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                    Dengan masuk, Anda menyetujui Syarat & Ketentuan serta Kebijakan Privasi kami.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    // User is authenticated, render the protected content
    return <>{children}</>;
}
