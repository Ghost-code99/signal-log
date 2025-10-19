'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function Problem() {
  const scrollToSolution = () => {
    document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' });
  };

  const problems = [
    {
      emoji: '📝',
      title: 'Scattered Ideas',
      description:
        'Notes spread across multiple tools, making it impossible to see the big picture or track progress effectively.',
    },
    {
      emoji: '⏰',
      title: 'Wasted Time',
      description:
        'Energy spent on organization instead of learning and building, delaying your path to predictable revenue.',
    },
    {
      emoji: '🚀',
      title: 'Lost Momentum',
      description:
        'Ideas get stuck in fragmented notes and unfinished drafts, causing founders to lose momentum on critical experiments.',
    },
  ];

  return (
    <section
      id="problem"
      className="py-20 sm:py-28 bg-background"
      aria-labelledby="problem-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-20 space-y-6"
          >
            <h2
              id="problem-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            >
              The Problem Every Founder Knows
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Indie SaaS founders validating product experiments struggle
              because their ideas, notes, and progress updates are scattered
              across tools and moments, slowing validation and hiding
              product-market fit signals.
            </p>
          </motion.div>

          <div
            className="grid md:grid-cols-3 gap-8 lg:gap-10 mb-16"
            role="list"
            aria-label="Key problems"
          >
            {problems.map((problem, index) => (
              <motion.article
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                role="listitem"
              >
                <Card className="h-full border-muted/40 bg-card/50 backdrop-blur hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:scale-105 transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-6" aria-hidden="true">
                      {problem.emoji}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {problem.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {problem.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button
              onClick={scrollToSolution}
              size="lg"
              className="bg-white text-black hover:bg-gray-100 hover:scale-105 px-8 py-6 text-base font-medium shadow-lg transition-all"
              aria-label="Scroll to solution section"
            >
              See Our Solution →
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
