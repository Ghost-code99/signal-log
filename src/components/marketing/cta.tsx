"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CTAModal } from "@/components/cta-modal";

export function CTA() {
  return (
    <section id="cta" className="py-24 sm:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8">
              Coming Soon
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
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
