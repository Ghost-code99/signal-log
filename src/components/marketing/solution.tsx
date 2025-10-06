"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function Solution() {
  const scrollToCTA = () => {
    document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      emoji: "💬",
      title: "Natural Capture",
      description: "Through chat-based collaboration, automatic summaries, and simple capture methods like voice-to-text, founders can offload mental overhead while the system keeps ideas structured.",
    },
    {
      emoji: "📊",
      title: "Visible Progress",
      description: "The workspace maintains a clear history, provides reminders, and surfaces signals that help validate experiments faster. Every experiment leaves a visible trail of learning.",
    },
  ];

  return (
    <section id="solution" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <Button
              onClick={scrollToCTA}
              size="lg"
              className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-base font-medium mb-12"
            >
              See Our Solution →
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Your AI Project Journal
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              An AI-assisted workspace designed to act like a collaborative companion for founders.
              Instead of scattered notes, turn ideas into evolving narratives that track progression over
              time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-muted/40 bg-card/50 backdrop-blur hover:border-teal-500/50 transition-colors">
                  <CardContent className="p-8 text-center">
                    <div className="text-5xl mb-6">{feature.emoji}</div>
                    <h3 className="text-xl font-semibold mb-4 text-teal-500">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

