'use client';

// Force rebuild - Removed Supabase Connection Test - 2024
// This component should NOT contain any Supabase test elements
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function Solution() {
  const scrollToCTA = () => {
    document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      emoji: '💬',
      title: 'Natural Capture',
      description:
        'Through chat-based collaboration, automatic summaries, and simple capture methods like voice-to-text, founders can offload mental overhead while the system keeps ideas structured.',
    },
    {
      emoji: '📊',
      title: 'Visible Progress',
      description:
        'The workspace maintains a clear history, provides reminders, and surfaces signals that help validate experiments faster. Every experiment leaves a visible trail of learning.',
    },
  ];

  return (
    <section
      id="solution"
      className="py-20 sm:py-28 bg-background"
      aria-labelledby="solution-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Button
              onClick={scrollToCTA}
              size="lg"
              className="bg-white text-black hover:bg-gray-100 hover:scale-105 px-8 py-6 text-base font-medium shadow-lg transition-all mb-16"
              aria-label="Scroll to call to action section"
            >
              See Our Solution →
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-20 space-y-6"
          >
            <h2
              id="solution-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            >
              Your AI Project Journal
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              An AI-assisted workspace designed to act like a collaborative
              companion for founders. Instead of scattered notes, turn ideas
              into evolving narratives that track progression over time.
            </p>
          </motion.div>

          <div
            className="grid md:grid-cols-2 gap-8 lg:gap-10"
            role="list"
            aria-label="Key features"
          >
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                role="listitem"
              >
                <Card className="h-full border-muted/40 bg-card/50 backdrop-blur hover:border-accent/50 hover:shadow-xl hover:shadow-accent/10 hover:scale-105 transition-all duration-300">
                  <CardContent className="p-10 text-center">
                    <div className="text-6xl mb-6" aria-hidden="true">
                      {feature.emoji}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold mb-5 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
