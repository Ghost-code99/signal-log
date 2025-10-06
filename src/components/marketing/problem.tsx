"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconUsers } from "@tabler/icons-react";

export function Problem() {
  const scrollToSolution = () => {
    document.getElementById("solution")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="problem" className="py-16 sm:py-24 bg-gradient-to-r from-muted/20 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">
              The Problem: From Scattered Ideas to Wasted Runway
            </h2>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
              <CardContent className="p-8 sm:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">For Solo Founders</h3>
                    <p className="text-muted-foreground mb-4">
                      You&apos;re tasked with generating and executing high-stakes ideas across all business functions—from product and marketing to sales and fundraising. But your current process is broken.
                    </p>
                    <p className="text-muted-foreground">
                      Ideas are fragmented across disparate systems: personal notes, team messages, customer call transcripts, and browser bookmarks. Existing tools act as &ldquo;idea graveyards&rdquo; where valuable concepts go to die.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconUsers className="w-10 h-10 text-accent" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pre-product-market fit startups with fewer than 10 employees
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <Button onClick={scrollToSolution} size="lg" className="px-8">
                See Our Solution
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

