import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Marketplace" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, isLoading, user, walletAddress, login, logout } =
    useAuth();

  function sliceAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  const displayWalletAddress = user?.walletAddress
    ? sliceAddress(user.walletAddress)
    : walletAddress
      ? sliceAddress(walletAddress)
      : "Not Found Address";
  // Format display name
  // const displayName = displayWalletAddress ? `${displayWalletAddress.slice(0, 6)}...${displayWalletAddress.slice(-4)}` : 'User';

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold gradient-text">ChainFund</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === link.href
                    ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-24 h-10 bg-[hsl(var(--muted))] rounded-lg animate-pulse" />
            ) : isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary))]/20 flex items-center justify-center">
                    <User size={14} className="text-[hsl(var(--primary))]" />
                  </div>
                  <span className="max-w-[120px] truncate">
                    {displayWalletAddress}
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition-transform",
                      isDropdownOpen && "rotate-180",
                    )}
                  />
                </Button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-lg z-20">
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">
                          {user?.email && <div>{user.email}</div>}

                          <div className="truncate font-mono">
                            {displayWalletAddress}
                          </div>
                        </div>
                        <hr className="my-2 border-[hsl(var(--border))]" />
                        <Link
                          to="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-[hsl(var(--muted))] transition-colors"
                        >
                          <User size={16} />
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] transition-colors"
                        >
                          <LogOut size={16} />
                          Keluar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button onClick={login} variant="gradient">
                Masuk
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[hsl(var(--muted))]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[hsl(var(--border))]">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === link.href
                      ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 px-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] rounded-lg">
                      <div className="font-medium text-[hsl(var(--foreground))]">
                        {displayWalletAddress}
                      </div>
                      {user?.email && (
                        <div className="truncate">{user.email}</div>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                    >
                      <LogOut size={16} />
                      Keluar
                    </Button>
                  </div>
                ) : (
                  <Button onClick={login} variant="gradient" className="w-full">
                    Masuk
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
