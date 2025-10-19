'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function Hero() {
  const scrollToProblem = () => {
    document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center bg-background"
      aria-label="Hero section"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Coming Soon Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <span
              className="text-sm text-muted-foreground px-4 py-2 bg-muted/50 rounded-full font-medium"
              role="status"
            >
              Coming Soon
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
          >
            AI Project Journal
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
          >
            for Indie SaaS Founders
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Transform scattered ideas into validated experiments. Track your
            journey from concept to product-market fit with AI-powered insights
            that keep you focused and moving forward.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center gap-4 pt-4"
          >
            <Button
              size="lg"
              onClick={scrollToProblem}
              className="bg-white text-black hover:bg-gray-100 hover:scale-105 px-8 py-6 text-base font-medium shadow-lg transition-all"
              aria-label="Scroll to problem section"
            >
              Discover the Problem →
            </Button>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Learn how we&apos;re solving the founder&apos;s dilemma
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
