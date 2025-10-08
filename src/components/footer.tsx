"use client";

import { ThemeToggle } from "@/components/theme-toggle";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center text-muted-foreground text-sm">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 mb-4 sm:mb-0">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/20">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-base">Signal Log</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>Made with</span>
              <a 
                href="https://pirateskills.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold hover:text-foreground transition-colors"
              >
                AARRR
              </a>
              <span>in Cologne</span>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                ✕
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <a
              href="https://pirateskills.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </a>
            <a
              href="https://www.iubenda.com/privacy-policy/8183741/full-legal"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}

