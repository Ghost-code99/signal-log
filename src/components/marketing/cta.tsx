"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { IconRocket } from "@tabler/icons-react";
import { CTAModal } from "@/components/cta-modal";

export function CTA() {
  return (
    <section id="cta" className="py-16 sm:py-24 bg-gradient-to-r from-accent/10 to-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Transform Your Strategic Thinking?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Stop losing valuable insights and start turning scattered ideas into validated experiments.
            </p>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
              <CardContent className="p-8">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconRocket className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground mb-6">
                    We&apos;re building something special for solo founders. Stay tuned for updates!
                  </p>
                  <CTAModal />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
