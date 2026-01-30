import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    TrendingUp,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const sidebarLinks = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
    { href: '/dashboard/investments', label: 'My Investments', icon: TrendingUp },
];

export function DashboardLayout() {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <div className="flex-1 flex">
                {/* Mobile Sidebar Toggle */}
                <button
                    className="lg:hidden fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full gradient-primary text-white shadow-lg flex items-center justify-center"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Sidebar */}
                <aside
                    className={cn(
                        'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))] transform transition-transform duration-300 lg:translate-x-0',
                        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    )}
                >
                    <div className="flex flex-col h-full pt-20 lg:pt-6 pb-6 px-4">
                        <div className="mb-6 px-2">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                                Dashboard
                            </h2>
                        </div>

                        <nav className="flex-1 space-y-1">
                            {sidebarLinks.map((link) => {
                                const isActive = location.pathname === link.href;
                                const Icon = link.icon;

                                return (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                            isActive
                                                ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-sm'
                                                : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]'
                                        )}
                                    >
                                        <Icon size={18} />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Help Card */}
                        <div className="mt-auto p-4 rounded-xl bg-[hsl(var(--muted))]">
                            <h3 className="font-medium text-sm mb-1">Need Help?</h3>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
                                Contact our support team for any questions.
                            </p>
                            <a
                                href="#"
                                className="text-xs font-medium text-[hsl(var(--primary))] hover:underline"
                            >
                                Get Support →
                            </a>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}
