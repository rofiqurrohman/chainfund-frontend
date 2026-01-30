import { Link } from 'react-router-dom';
import {
    Shield,
    TrendingUp,
    Lock,
    Zap,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectCard } from '@/components/shared/ProjectCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { mockProjects } from '@/services/mockData';

const valueProps = [
    {
        icon: Shield,
        title: 'Transparent',
        description: 'Every transaction recorded on-chain. Track your investment in real-time.',
        color: 'text-blue-600 bg-blue-500/10',
    },
    {
        icon: TrendingUp,
        title: 'High Yield',
        description: 'Earn competitive returns from real business profits, not speculation.',
        color: 'text-green-600 bg-green-500/10',
    },
    {
        icon: Lock,
        title: 'Secure',
        description: 'Smart contracts ensure automated, trustless profit distribution.',
        color: 'text-purple-600 bg-purple-500/10',
    },
    {
        icon: Zap,
        title: 'Efficient',
        description: 'Low fees, instant settlements. No middlemen, no delays.',
        color: 'text-yellow-600 bg-yellow-500/10',
    },
];

const howItWorks = [
    {
        step: '01',
        title: 'Connect Wallet',
        description: 'Link your crypto wallet securely with one click. Your identity, your control.',
    },
    {
        step: '02',
        title: 'Choose Project',
        description: 'Browse verified MSMEs with detailed financials and risk assessments.',
    },
    {
        step: '03',
        title: 'Invest IDRX',
        description: 'Invest using digital Rupiah (IDRX). Minimum investment from Rp 100,000.',
    },
    {
        step: '04',
        title: 'Earn Returns',
        description: 'Receive profit distributions automatically to your wallet.',
    },
];

export function HomePage() {
    const featuredProjects = mockProjects.slice(0, 3);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 lg:py-32">
                    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/5 via-transparent to-[hsl(var(--accent))]/5" />
                    <div className="absolute top-20 left-10 w-72 h-72 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-[hsl(var(--accent))]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center max-w-4xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-medium mb-6 animate-fade-in">
                                <Zap size={16} />
                                <span>Powered by Base Network</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up">
                                Invest in Real Business,{' '}
                                <span className="gradient-text">On-Chain</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                Support Indonesian MSMEs and earn transparent returns. Your investment, secured by blockchain technology.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                <Button asChild size="xl" variant="gradient">
                                    <Link to="/projects">
                                        Explore Projects
                                        <ArrowRight size={20} />
                                    </Link>
                                </Button>
                                <Button asChild size="xl" variant="outline">
                                    <a href="#how-it-works">Learn How It Works</a>
                                </Button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-16 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
                                <div>
                                    <p className="text-2xl sm:text-3xl font-bold gradient-text">Rp 5B+</p>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Funded</p>
                                </div>
                                <div>
                                    <p className="text-2xl sm:text-3xl font-bold gradient-text">1,200+</p>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Investors</p>
                                </div>
                                <div>
                                    <p className="text-2xl sm:text-3xl font-bold gradient-text">18.5%</p>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Avg. Return</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Value Props */}
                <section className="py-20 bg-[hsl(var(--muted))]/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Why ChainFund?</h2>
                            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
                                We combine the efficiency of blockchain with the tangibility of real-world assets.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {valueProps.map((prop, index) => (
                                <Card key={index} className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                    <CardContent className="p-6 text-center">
                                        <div className={`w-14 h-14 rounded-2xl ${prop.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                                            <prop.icon size={28} />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">{prop.title}</h3>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{prop.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Projects */}
                {/* <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">Featured Projects</h2>
                                <p className="text-[hsl(var(--muted-foreground))]">
                                    Discover high-potential MSMEs ready for your investment.
                                </p>
                            </div>
                            <Button asChild variant="outline" className="hidden sm:flex">
                                <Link to="/projects">
                                    View All
                                    <ArrowRight size={16} />
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 project-demo-section">
                            {featuredProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}

                        </div>

                        <div className="mt-8 text-center sm:hidden">
                            <Button asChild variant="outline">
                                <Link to="/projects">
                                    View All Projects
                                    <ArrowRight size={16} />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section> */}

                {/* How It Works */}
                <section id="how-it-works" className="py-20 bg-[hsl(var(--muted))]/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
                                Start investing in 4 simple steps. No complicated crypto knowledge required.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {howItWorks.map((item, index) => (
                                <div key={index} className="relative">
                                    <div className="text-6xl font-bold text-[hsl(var(--primary))]/10 mb-4">
                                        {item.step}
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.description}</p>

                                    {index < howItWorks.length - 1 && (
                                        <ArrowRight className="hidden lg:block absolute top-8 -right-4 text-[hsl(var(--primary))]/30" size={24} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Learn More Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Investment Basics</h2>
                            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
                                Everything you need to know before making your first investment.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                                        <TrendingUp className="text-green-600" size={24} />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">Understanding Returns</h3>
                                    <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Returns are based on actual business profits</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>ROI ranges from 12% to 25% annually</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Profits distributed monthly or quarterly</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4">
                                        <AlertTriangle className="text-yellow-600" size={24} />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">Risk Assessment</h3>
                                    <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Each project rated Low/Medium/High risk</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Detailed financial due diligence provided</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Diversify across multiple projects</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                                        <Clock className="text-blue-600" size={24} />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">Lock Period</h3>
                                    <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Funds locked during project duration</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Typical periods: 6-24 months</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Early exit available with secondary market</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Legal & Risk Section */}
                <section className="py-20 bg-[hsl(var(--muted))]/30">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Card className="border-yellow-500/30 bg-yellow-500/5">
                            <CardContent className="p-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="text-yellow-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-3">Important Risk Disclosure</h3>
                                        <div className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                                            <p>
                                                <strong>Investment Risk:</strong> All investments carry risk. Past performance does not guarantee future results. You may lose part or all of your investment.
                                            </p>
                                            <p>
                                                <strong>Not Financial Advice:</strong> ChainFund provides a platform for investment opportunities but does not provide financial advice. Please consult a professional advisor.
                                            </p>
                                            <p>
                                                <strong>Regulatory Status:</strong> ChainFund operates under applicable Indonesian regulations. IDRX is a digital representation of Rupiah on blockchain.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="p-12 rounded-3xl gradient-primary text-white">
                            <Users size={48} className="mx-auto mb-6 opacity-80" />
                            <h2 className="text-3xl font-bold mb-4">
                                Join 1,200+ Investors Today
                            </h2>
                            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                                Start investing with as little as Rp 500,000 and support Indonesian small businesses.
                            </p>
                            <Button asChild size="xl" variant="secondary" className="bg-white text-[hsl(var(--primary))] hover:bg-white/90">
                                <Link to="/projects">
                                    Start Investing Now
                                    <ArrowRight size={20} />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
