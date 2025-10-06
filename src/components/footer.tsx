"use client";

import { ThemeToggle } from "@/components/theme-toggle";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Signal Log</span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <span>Made with</span>
              <a 
                href="https://pirateskills.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline font-medium"
              >
                AARRR
              </a>
              <span>in Cologne</span>
              <span>🏴‍☠️</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <a
              href="https://pirateskills.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-accent transition-colors"
            >
              Contact
            </a>
            <a
              href="https://www.iubenda.com/privacy-policy/8183741/full-legal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-accent transition-colors"
            >
              Privacy Policy
            </a>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Theme:</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

