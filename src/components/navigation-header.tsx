'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Search, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
}

interface NavigationHeaderProps {
  logo?: React.ReactNode;
  navigationItems?: NavigationItem[];
  showSearch?: boolean;
  showUserMenu?: boolean;
  className?: string;
}

export function NavigationHeader({
  logo,
  navigationItems = [],
  showSearch = true,
  showUserMenu = true,
  className
}: NavigationHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const defaultLogo = (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">S</span>
      </div>
      <span className="text-xl font-semibold text-gray-900">Signal Log</span>
    </div>
  );

  const defaultNavigationItems: NavigationItem[] = [
    { label: 'Dashboard', href: '/dashboard', active: true },
    { label: 'Projects', href: '/projects' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Settings', href: '/settings' }
  ];

  const items = navigationItems.length > 0 ? navigationItems : defaultNavigationItems;

  return (
    <header className={cn(
      "bg-white border-b border-gray-200 sticky top-0 z-50",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {logo || defaultLogo}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  item.active
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            {showSearch && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline">Search</span>
              </Button>
            )}

            {/* User Menu */}
            {showUserMenu && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <User className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200",
                    item.active
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {showSearch && (
                <div className="px-3 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-gray-600"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
