"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CTAModal } from "@/components/cta-modal";

export function CTA() {
  return (
    <section id="cta" className="py-28 sm:py-36 bg-background" aria-labelledby="cta-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <h2 id="cta-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Coming Soon
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We&apos;re building something amazing for indie SaaS founders. Stay tuned for
              updates on our AI-assisted workspace.
            </p>
            <CTAModal />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
