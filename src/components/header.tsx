'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { CTAModal } from '@/components/cta-modal';
import { useAuth } from '@/lib/auth-context';
import { UserMenu } from '@/components/auth/user-menu';
import { AuthModal } from '@/components/auth/auth-modal';
import Link from 'next/link';

const navigation = [
  { name: 'Problem', href: '#problem' },
  { name: 'Solution', href: '#solution' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Get Started', href: '#cta' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  const handleNavigation = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = href;
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm bg-gradient-to-r from-primary via-accent to-primary">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-lg sm:text-xl text-white">Signal Log</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map(item => (
              <Button
                key={item.name}
                variant="ghost"
                onClick={() => handleNavigation(item.href)}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200"
              >
                {item.name}
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="h-10 sm:h-8 min-w-[44px] sm:min-w-0">
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Dash</span>
                </Button>
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <div className="hidden sm:block">
                <CTAModal />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="h-10 sm:h-8 min-w-[44px] sm:min-w-0"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In
              </Button>
            </>
          )}
          <ThemeToggle />

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-10 w-10 min-w-[44px] p-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  mobileMenuOpen
                    ? 'M6 18L18 6M6 6l12 12'
                    : 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
                }
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/20 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm bg-gradient-to-r from-primary via-accent to-primary">
          <div className="container px-4 py-4 space-y-2">
            {navigation.map(item => (
              <Button
                key={item.name}
                variant="ghost"
                onClick={() => handleNavigation(item.href)}
                className="w-full justify-start text-base sm:text-sm font-medium text-white/80 hover:text-white transition-colors duration-200 h-11 sm:h-9 min-h-[44px] sm:min-h-0"
              >
                {item.name}
              </Button>
            ))}
            <div className="pt-2 border-t border-white/20">
              {user ? (
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full h-11 min-h-[44px]">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <CTAModal />
              )}
            </div>
          </div>
        </div>
      )}
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
}
