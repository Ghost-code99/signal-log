"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBrain, IconTarget, IconUsers } from "@tabler/icons-react";

export function Solution() {
  const scrollToCTA = () => {
    document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="solution" className="py-16 sm:py-24 bg-gradient-to-br from-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              The Solution: An AI Strategy Partner
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-accent/20 bg-gradient-to-br from-background to-accent/5">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <IconBrain className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">AI-Powered Synthesis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Automatically cluster related ideas, identify patterns, and surface insights you might have missed.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-accent/20 bg-gradient-to-br from-background to-accent/5">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <IconTarget className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Strategic Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Challenge assumptions, brainstorm next steps, and transform concepts into structured experiments.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-accent/20 bg-gradient-to-br from-background to-accent/5">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <IconUsers className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Proactive Momentum</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Intelligent reminders and weekly digests resurface high-potential ideas, keeping you focused and forward-looking.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                While other tools help you <em>store</em> information, our solution helps you <strong className="text-accent">think</strong>. It&apos;s the only tool designed for the crucial process of strategic development and validation.
              </p>
              <Button onClick={scrollToCTA} size="lg" className="px-8">
                Get Started Today
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

